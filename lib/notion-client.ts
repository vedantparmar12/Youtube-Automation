import { z } from 'zod';
import { PRPContent, PRPTask } from '../types/prp-types';

// Notion API error with retry information
export class NotionAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'NotionAPIError';
  }
}

// Notion block types for formatting
type NotionBlock = {
  object: 'block';
  type: string;
  [key: string]: any;
};

export class NotionClient {
  private readonly baseUrl = 'https://api.notion.com/v1';
  private readonly version = '2022-06-28';
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000;

  constructor(private token: string) {
    if (!token) {
      throw new Error('Notion integration token is required');
    }
  }

  // Create headers for Notion API requests
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Notion-Version': this.version,
      'Content-Type': 'application/json',
    };
  }

  // Exponential backoff with jitter
  private async delay(attempt: number): Promise<void> {
    const delay = this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Make API request with retry logic
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
        });

        if (response.status === 429) {
          // Rate limit exceeded
          if (attempt < this.maxRetries - 1) {
            await this.delay(attempt);
            continue;
          }
          throw new NotionAPIError('Notion API rate limit exceeded', 429);
        }

        if (!response.ok) {
          const error = await response.json();
          throw new NotionAPIError(
            error.message || `Notion API error: ${response.status}`,
            response.status,
            error.code
          );
        }

        return await response.json();
      } catch (error) {
        if (error instanceof NotionAPIError) {
          throw error;
        }
        if (attempt === this.maxRetries - 1) {
          throw new Error(`Notion API request failed after ${this.maxRetries} attempts: ${error}`);
        }
        await this.delay(attempt);
      }
    }

    throw new Error('Notion API request failed');
  }

  // Validate that a database exists and is accessible
  async validateDatabase(databaseId: string): Promise<boolean> {
    try {
      await this.makeRequest<any>('GET', `databases/${databaseId}`);
      return true;
    } catch (error) {
      if (error instanceof NotionAPIError && error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  // Convert PRP content to Notion blocks
  private createPRPBlocks(prp: PRPContent, metadata: any): NotionBlock[] {
    const blocks: NotionBlock[] = [];

    // Title
    blocks.push({
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [{
          type: 'text',
          text: { content: prp.name }
        }]
      }
    });

    // Description
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: prp.description }
        }]
      }
    });

    // Video Information
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{
          type: 'text',
          text: { content: '📹 Video Information' }
        }]
      }
    });

    blocks.push({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{
          type: 'text',
          text: { content: `Title: ${metadata.video_title}` }
        }]
      }
    });

    blocks.push({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{
          type: 'text',
          text: { content: `Channel: ${metadata.channel_title}` }
        }]
      }
    });

    blocks.push({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{
          type: 'text',
          text: { content: `URL: ` },
        }, {
          type: 'text',
          text: { content: metadata.youtube_url, link: { url: metadata.youtube_url } }
        }]
      }
    });

    // Goal
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{
          type: 'text',
          text: { content: '🎯 Goal' }
        }]
      }
    });

    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: prp.goal }
        }]
      }
    });

    // Why
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{
          type: 'text',
          text: { content: '❓ Why' }
        }]
      }
    });

    prp.why.forEach(reason => {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            type: 'text',
            text: { content: reason }
          }]
        }
      });
    });

    // What
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{
          type: 'text',
          text: { content: '📋 What' }
        }]
      }
    });

    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: prp.what }
        }]
      }
    });

    // Success Criteria
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{
          type: 'text',
          text: { content: '✅ Success Criteria' }
        }]
      }
    });

    prp.success_criteria.forEach(criteria => {
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{
            type: 'text',
            text: { content: criteria }
          }],
          checked: false
        }
      });
    });

    // Tasks
    if (prp.tasks && prp.tasks.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{
            type: 'text',
            text: { content: '🔨 Tasks' }
          }]
        }
      });

      prp.tasks.forEach((task, index) => {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{
              type: 'text',
              text: { content: `${index + 1}. ${task.title}` }
            }]
          }
        });

        if (task.description) {
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{
                type: 'text',
                text: { content: task.description }
              }]
            }
          });
        }

        if (task.file_path) {
          blocks.push({
            object: 'block',
            type: 'callout',
            callout: {
              rich_text: [{
                type: 'text',
                text: { content: `📁 File: ${task.file_path}` }
              }],
              icon: { emoji: '📁' }
            }
          });
        }

        if (task.pseudocode) {
          blocks.push({
            object: 'block',
            type: 'code',
            code: {
              rich_text: [{
                type: 'text',
                text: { content: task.pseudocode }
              }],
              language: 'typescript'
            }
          });
        }
      });
    }

    return blocks;
  }

  // Create a new page in a Notion database
  async createDatabasePage(
    databaseId: string,
    prp: PRPContent,
    metadata: {
      youtube_url: string;
      video_title: string;
      channel_title: string;
      created_by: string;
      prp_id: string;
    }
  ): Promise<string> {
    // Validate database exists
    const isValid = await this.validateDatabase(databaseId);
    if (!isValid) {
      throw new NotionAPIError(`Database ${databaseId} not found or not accessible`, 404);
    }

    // Create page properties
    const properties: any = {
      'Name': {
        title: [{
          text: { content: prp.name }
        }]
      },
      'YouTube URL': {
        url: metadata.youtube_url
      },
      'Video Title': {
        rich_text: [{
          text: { content: metadata.video_title }
        }]
      },
      'Channel': {
        rich_text: [{
          text: { content: metadata.channel_title }
        }]
      },
      'Created By': {
        rich_text: [{
          text: { content: metadata.created_by }
        }]
      },
      'PRP ID': {
        rich_text: [{
          text: { content: metadata.prp_id }
        }]
      },
      'Task Count': {
        number: prp.tasks?.length || 0
      },
      'Status': {
        select: { name: 'Parsed' }
      }
    };

    // Create the page
    const response = await this.makeRequest<any>('POST', 'pages', {
      parent: { database_id: databaseId },
      properties,
      children: this.createPRPBlocks(prp, metadata).slice(0, 100) // Notion limit
    });

    return response.id;
  }

  // Update an existing Notion page
  async updateDatabasePage(
    pageId: string,
    updates: {
      properties?: any;
      archived?: boolean;
    }
  ): Promise<void> {
    await this.makeRequest<any>('PATCH', `pages/${pageId}`, updates);
  }

  // Append blocks to an existing page
  async appendBlocks(pageId: string, blocks: NotionBlock[]): Promise<void> {
    // Notion has a limit of 100 blocks per request
    const chunks = [];
    for (let i = 0; i < blocks.length; i += 100) {
      chunks.push(blocks.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      await this.makeRequest<any>('PATCH', `blocks/${pageId}/children`, {
        children: chunk
      });
    }
  }

  // Search for existing pages by PRP ID
  async findPageByPRPId(databaseId: string, prpId: string): Promise<string | null> {
    const response = await this.makeRequest<any>('POST', 'databases/' + databaseId + '/query', {
      filter: {
        property: 'PRP ID',
        rich_text: {
          equals: prpId
        }
      }
    });

    if (response.results && response.results.length > 0) {
      return response.results[0].id;
    }

    return null;
  }
}