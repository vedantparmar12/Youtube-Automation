#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { YouTubeNotionIntegration } from './services/YouTubeNotionIntegration.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { validateEnvironment } from './utils/validation.js';

class YouTubeNotionMCPServer {
  private server: Server;
  private integration: YouTubeNotionIntegration;

  constructor() {
    this.server = new Server(
      {
        name: 'youtube-notion-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.integration = new YouTubeNotionIntegration();
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_youtube_videos',
            description: 'Search for YouTube videos by query',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for YouTube videos',
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 10)',
                  default: 10,
                },
                order: {
                  type: 'string',
                  enum: ['relevance', 'date', 'rating', 'title', 'viewCount'],
                  description: 'Order of results (default: relevance)',
                  default: 'relevance',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_youtube_video_details',
            description: 'Get detailed information about a YouTube video',
            inputSchema: {
              type: 'object',
              properties: {
                videoId: {
                  type: 'string',
                  description: 'YouTube video ID',
                },
              },
              required: ['videoId'],
            },
          },
          {
            name: 'create_notion_page',
            description: 'Create a new page in Notion database',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the Notion page',
                },
                content: {
                  type: 'string',
                  description: 'Content of the page',
                },
                properties: {
                  type: 'object',
                  description: 'Additional properties for the page',
                },
              },
              required: ['title'],
            },
          },
          {
            name: 'save_youtube_video_to_notion',
            description: 'Save a YouTube video to Notion database',
            inputSchema: {
              type: 'object',
              properties: {
                videoId: {
                  type: 'string',
                  description: 'YouTube video ID',
                },
                customTitle: {
                  type: 'string',
                  description: 'Custom title for the Notion page (optional)',
                },
                notes: {
                  type: 'string',
                  description: 'Additional notes about the video (optional)',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tags to add to the video (optional)',
                },
              },
              required: ['videoId'],
            },
          },
          {
            name: 'list_notion_pages',
            description: 'List pages from Notion database',
            inputSchema: {
              type: 'object',
              properties: {
                filter: {
                  type: 'object',
                  description: 'Filter criteria for pages',
                },
                sorts: {
                  type: 'array',
                  description: 'Sort criteria for pages',
                },
                pageSize: {
                  type: 'number',
                  description: 'Number of pages to return (default: 10)',
                  default: 10,
                },
              },
              required: [],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_youtube_videos':
            return await this.integration.searchYouTubeVideos(args);

          case 'get_youtube_video_details':
            return await this.integration.getYouTubeVideoDetails(args);

          case 'create_notion_page':
            return await this.integration.createNotionPage(args);

          case 'save_youtube_video_to_notion':
            return await this.integration.saveYouTubeVideoToNotion(args);

          case 'list_notion_pages':
            return await this.integration.listNotionPages(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        logger.error('Tool execution error:', error);
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
      }
    });
  }

  async start(): Promise<void> {
    try {
      // Validate environment variables
      validateEnvironment();

      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      logger.info('YouTube-Notion MCP Server started successfully');
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new YouTubeNotionMCPServer();
server.start().catch((error) => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});
