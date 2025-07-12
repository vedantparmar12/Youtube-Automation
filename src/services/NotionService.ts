import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { NotionPage, NotionCreatePageParams, NotionListPagesParams } from '../types/index.js';

export class NotionService {
  private apiKey: string;
  private databaseId: string;
  private baseUrl = 'https://api.notion.com/v1';
  private version = '2022-06-28';

  constructor() {
    this.apiKey = config.notion.apiKey;
    this.databaseId = config.notion.databaseId;
  }

  async createPage(params: NotionCreatePageParams): Promise<NotionPage> {
    try {
      const response = await axios.post(`${this.baseUrl}/pages`, {
        parent: { database_id: this.databaseId },
        properties: {
          title: [
            {
              text: {
                content: params.title,
              },
            },
          ],
          ...(params.properties || {}),
        },
        ...(params.content && { children: [{ object: 'block', type: 'paragraph', paragraph: { text: [{ type: 'text', text: { content: params.content } }] } }] }),
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': this.version,
          'Content-Type': 'application/json',
        },
      });

      const { id, created_time, last_edited_time, properties, url } = response.data;
      logger.info('Notion page created successfully', { pageId: id, title: params.title });
      return { id, title: params.title, url, createdTime: created_time, lastEditedTime: last_edited_time, properties };
    } catch (error) {
      logger.error('Failed to create Notion page', error);
      throw new Error(`Notion API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listPages(params: NotionListPagesParams): Promise<NotionPage[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/databases/${this.databaseId}/query`, {
        filter: params.filter,
        sorts: params.sorts,
        page_size: params.pageSize,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': this.version,
          'Content-Type': 'application/json',
        },
      });

      const pages: NotionPage[] = response.data.results.map((item: any) => {
        const { id, properties, url, created_time, last_edited_time } = item;
        return { id, title: properties.title[0].text.content, url, createdTime: created_time, lastEditedTime: last_edited_time, properties };
      });

      logger.info('Notion pages retrieved successfully', { count: pages.length });
      return pages;
    } catch (error) {
      logger.error('Failed to list Notion pages', error);
      throw new Error(`Notion API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
