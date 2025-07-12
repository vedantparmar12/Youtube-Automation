import { YouTubeService } from './YouTubeService.js';
import { NotionService } from './NotionService.js';
import { logger } from '../utils/logger.js';
import { 
  YouTubeVideo, 
  YouTubeSearchResult, 
  NotionPage, 
  SaveVideoToNotionArgs,
  SearchYouTubeVideosArgs,
  GetYouTubeVideoDetailsArgs,
  CreateNotionPageArgs,
  ListNotionPagesArgs
} from '../types/index.js';

export class YouTubeNotionIntegration {
  private youtubeService: YouTubeService;
  private notionService: NotionService;

  constructor() {
    this.youtubeService = new YouTubeService();
    this.notionService = new NotionService();
  }

  async searchYouTubeVideos(args: SearchYouTubeVideosArgs): Promise<{ content: YouTubeSearchResult[] }> {
    try {
      logger.info('Searching YouTube videos', { query: args.query, maxResults: args.maxResults });
      
      const results = await this.youtubeService.searchVideos({
        query: args.query,
        maxResults: args.maxResults || 10,
        order: args.order || 'relevance',
      });

      logger.info('YouTube search completed', { resultsCount: results.length });
      
      return {
        content: results,
      };
    } catch (error) {
      logger.error('Failed to search YouTube videos', error);
      throw new Error(`YouTube search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getYouTubeVideoDetails(args: GetYouTubeVideoDetailsArgs): Promise<{ content: YouTubeVideo }> {
    try {
      logger.info('Getting YouTube video details', { videoId: args.videoId });
      
      const video = await this.youtubeService.getVideoDetails(args.videoId);
      
      logger.info('YouTube video details retrieved', { videoId: args.videoId, title: video.title });
      
      return {
        content: video,
      };
    } catch (error) {
      logger.error('Failed to get YouTube video details', error);
      throw new Error(`Failed to get video details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createNotionPage(args: CreateNotionPageArgs): Promise<{ content: NotionPage }> {
    try {
      logger.info('Creating Notion page', { title: args.title });
      
      const page = await this.notionService.createPage({
        title: args.title,
        content: args.content,
        properties: args.properties,
      });
      
      logger.info('Notion page created', { pageId: page.id, title: args.title });
      
      return {
        content: page,
      };
    } catch (error) {
      logger.error('Failed to create Notion page', error);
      throw new Error(`Failed to create page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveYouTubeVideoToNotion(args: SaveVideoToNotionArgs): Promise<{ content: NotionPage }> {
    try {
      logger.info('Saving YouTube video to Notion', { videoId: args.videoId });
      
      // Get video details from YouTube
      const video = await this.youtubeService.getVideoDetails(args.videoId);
      
      // Create Notion page with video information
      const pageTitle = args.customTitle || video.title;
      const pageContent = this.formatVideoContentForNotion(video, args.notes);
      
      const page = await this.notionService.createPage({
        title: pageTitle,
        content: pageContent,
        properties: {
          'Video ID': video.id,
          'Channel': video.channelTitle,
          'Published': video.publishedAt,
          'Duration': video.duration,
          'Views': video.viewCount,
          'Likes': video.likeCount,
          'URL': `https://www.youtube.com/watch?v=${video.id}`,
          'Tags': args.tags || [],
        },
      });
      
      logger.info('YouTube video saved to Notion', { 
        videoId: args.videoId, 
        pageId: page.id,
        title: pageTitle 
      });
      
      return {
        content: page,
      };
    } catch (error) {
      logger.error('Failed to save YouTube video to Notion', error);
      throw new Error(`Failed to save video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listNotionPages(args: ListNotionPagesArgs): Promise<{ content: NotionPage[] }> {
    try {
      logger.info('Listing Notion pages', { filter: args.filter, pageSize: args.pageSize });
      
      const pages = await this.notionService.listPages({
        filter: args.filter,
        sorts: args.sorts,
        pageSize: args.pageSize || 10,
      });
      
      logger.info('Notion pages retrieved', { count: pages.length });
      
      return {
        content: pages,
      };
    } catch (error) {
      logger.error('Failed to list Notion pages', error);
      throw new Error(`Failed to list pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatVideoContentForNotion(video: YouTubeVideo, notes?: string): string {
    const content = [
      `# ${video.title}`,
      '',
      `**Channel:** ${video.channelTitle}`,
      `**Published:** ${new Date(video.publishedAt).toLocaleDateString()}`,
      `**Duration:** ${video.duration}`,
      `**Views:** ${video.viewCount?.toLocaleString() || 'N/A'}`,
      `**Likes:** ${video.likeCount?.toLocaleString() || 'N/A'}`,
      '',
      `**URL:** [Watch on YouTube](https://www.youtube.com/watch?v=${video.id})`,
      '',
      '## Description',
      video.description || 'No description available',
      '',
    ];

    if (notes) {
      content.push('## Notes');
      content.push(notes);
      content.push('');
    }

    return content.join('\n');
  }
}
