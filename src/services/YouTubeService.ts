import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { YouTubeVideo, YouTubeSearchResult, YouTubeSearchParams } from '../types/index.js';

export class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = config.youtube.apiKey;
  }

  async searchVideos(params: YouTubeSearchParams): Promise<YouTubeSearchResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          key: this.apiKey,
          part: 'snippet',
          type: 'video',
          q: params.query,
          maxResults: params.maxResults,
          order: params.order,
        },
      });

      const results: YouTubeSearchResult[] = response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));

      logger.debug('YouTube search results', { query: params.query, count: results.length });
      return results;
    } catch (error) {
      logger.error('YouTube search failed', error);
      throw new Error(`YouTube API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getVideoDetails(videoId: string): Promise<YouTubeVideo> {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          key: this.apiKey,
          part: 'snippet,statistics,contentDetails',
          id: videoId,
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`Video not found: ${videoId}`);
      }

      const item = response.data.items[0];
      const video: YouTubeVideo = {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
        duration: this.parseDuration(item.contentDetails.duration),
        viewCount: parseInt(item.statistics.viewCount, 10),
        likeCount: parseInt(item.statistics.likeCount, 10),
        commentCount: parseInt(item.statistics.commentCount, 10),
        tags: item.snippet.tags || [],
        categoryId: item.snippet.categoryId,
        defaultLanguage: item.snippet.defaultLanguage,
        url: `https://www.youtube.com/watch?v=${item.id}`,
      };

      logger.debug('YouTube video details retrieved', { videoId, title: video.title });
      return video;
    } catch (error) {
      logger.error('Failed to get YouTube video details', error);
      throw new Error(`YouTube API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseDuration(isoDuration: string): string {
    // Parse ISO 8601 duration format (PT4M13S) to human-readable format
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return isoDuration;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
  }
}
