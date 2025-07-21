import { z } from 'zod';

// Video metadata schema matching YouTube API response
const VideoMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  channelTitle: z.string(),
  publishedAt: z.string(),
  duration: z.string(),
});

export type VideoMetadata = z.infer<typeof VideoMetadataSchema>;

// YouTube API error with retry information
export class YouTubeAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'YouTubeAPIError';
  }
}

// Extract video ID from various YouTube URL formats
export function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  throw new Error('Invalid YouTube URL format');
}

// Parse ISO 8601 duration to human-readable format
function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
}

export class YouTubeClient {
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000;

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('YouTube API key is required');
    }
  }

  // Exponential backoff with jitter
  private async delay(attempt: number): Promise<void> {
    const delay = this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Make API request with retry logic
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    url.searchParams.set('key', this.apiKey);

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url.toString());

        if (response.status === 429) {
          // Rate limit exceeded
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          if (attempt < this.maxRetries - 1) {
            await this.delay(attempt);
            continue;
          }
          throw new YouTubeAPIError('YouTube API rate limit exceeded', 429, retryAfter);
        }

        if (!response.ok) {
          const error = await response.text();
          throw new YouTubeAPIError(
            `YouTube API error: ${response.status} - ${error}`,
            response.status
          );
        }

        return await response.json();
      } catch (error) {
        if (error instanceof YouTubeAPIError) {
          throw error;
        }
        if (attempt === this.maxRetries - 1) {
          throw new Error(`YouTube API request failed after ${this.maxRetries} attempts: ${error}`);
        }
        await this.delay(attempt);
      }
    }

    throw new Error('YouTube API request failed');
  }

  // Get video metadata including title, description, channel, etc.
  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    const response = await this.makeRequest<any>('videos', {
      id: videoId,
      part: 'snippet,contentDetails',
    });

    if (!response.items || response.items.length === 0) {
      throw new Error(`Video not found: ${videoId}`);
    }

    const item = response.items[0];
    return VideoMetadataSchema.parse({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: parseDuration(item.contentDetails.duration),
    });
  }

  // Get video transcript/captions
  async getVideoTranscript(videoId: string): Promise<string> {
    try {
      // First, try to get captions list
      const captionsResponse = await this.makeRequest<any>('captions', {
        videoId: videoId,
        part: 'snippet',
      });

      if (!captionsResponse.items || captionsResponse.items.length === 0) {
        throw new Error('No captions available');
      }

      // Find English captions (or fallback to first available)
      const caption = captionsResponse.items.find((item: any) => 
        item.snippet.language === 'en' || item.snippet.language.startsWith('en-')
      ) || captionsResponse.items[0];

      // Note: Actually downloading captions requires OAuth or the video owner's permission
      // For now, we'll return a message indicating manual transcript may be needed
      console.warn(`Captions found for video ${videoId} but download requires additional permissions`);
      
      // Fallback: Use video description as a basic transcript alternative
      const metadata = await this.getVideoMetadata(videoId);
      return `[Transcript not available via API. Using video description as fallback]\n\n${metadata.description}`;
      
    } catch (error) {
      // If captions API fails, use description as fallback
      console.warn(`Failed to get transcript for video ${videoId}: ${error}`);
      const metadata = await this.getVideoMetadata(videoId);
      return `[Transcript extraction failed. Using video description]\n\n${metadata.description}`;
    }
  }

  // Search for videos by query
  async searchVideos(query: string, maxResults: number = 10): Promise<any[]> {
    const response = await this.makeRequest<any>('search', {
      q: query,
      type: 'video',
      part: 'snippet',
      maxResults: maxResults.toString(),
    });

    return response.items || [];
  }
}