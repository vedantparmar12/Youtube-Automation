import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Props, createSuccessResponse, createErrorResponse } from "../types";
import { 
  SyncToNotionSchema,
  NotionSyncResponse,
  ParsedPRP,
  DatabasePRPRow
} from "../../types/prp-types";
import { NotionClient } from "../../lib/notion-client";
import { withDatabase } from "../database/utils";
import { formatDatabaseError } from "../database/security";
import postgres from "postgres";

// Allowed users for write operations
const ALLOWED_USERNAMES = new Set<string>(['coleam00', 'vedantparmar12']);

export function registerNotionTools(server: McpServer, env: Env, props: Props) {
  // Tool: Sync PRP to Notion
  server.tool(
    "syncToNotion",
    "Sync a parsed PRP to a Notion database, creating or updating a page with the PRP content",
    {
      prp_id: z.string().uuid().describe('UUID of the parsed PRP to sync'),
      database_id: z.string().describe('Notion database ID'),
      update_existing: z.boolean().default(false).describe('Update if page already exists'),
    },
    async ({ prp_id, database_id, update_existing }) => {
      try {
        // Check permissions for write operations
        if (!ALLOWED_USERNAMES.has(props.login)) {
          return createErrorResponse(
            "Insufficient permissions for Notion sync",
            { 
              requiredRole: "privileged", 
              userRole: "standard",
              user: props.login 
            }
          );
        }

        // Fetch PRP from database
        const prp = await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
          const [row] = await db<DatabasePRPRow[]>`
            SELECT * FROM parsed_prps WHERE id = ${prp_id}
          `;
          
          if (!row) {
            throw new Error(`PRP not found: ${prp_id}`);
          }
          
          return row;
        });

        // Parse the stored JSON content
        const prpContent = typeof prp.parsed_content === 'string' 
          ? JSON.parse(prp.parsed_content)
          : prp.parsed_content;

        // Initialize Notion client
        const notion = new NotionClient(env.NOTION_TOKEN);

        // Check if page already exists
        let notionPageId: string | null = prp.notion_page_id;
        let existingPageId: string | null = null;

        if (update_existing || !notionPageId) {
          existingPageId = await notion.findPageByPRPId(database_id, prp_id);
        }

        let syncStatus: 'synced' | 'failed' = 'synced';
        let syncError: string | undefined;

        try {
          if (existingPageId && update_existing) {
            // Update existing page
            console.log(`Updating existing Notion page: ${existingPageId}`);
            await notion.updateDatabasePage(existingPageId, {
              properties: {
                'Name': {
                  title: [{
                    text: { content: prpContent.name }
                  }]
                },
                'Video Title': {
                  rich_text: [{
                    text: { content: prp.video_title }
                  }]
                },
                'Task Count': {
                  number: prpContent.tasks?.length || 0
                },
                'Status': {
                  select: { name: 'Updated' }
                }
              }
            });
            notionPageId = existingPageId;
          } else if (!notionPageId || !existingPageId) {
            // Create new page
            console.log(`Creating new Notion page in database: ${database_id}`);
            notionPageId = await notion.createDatabasePage(
              database_id,
              prpContent,
              {
                youtube_url: prp.youtube_url,
                video_title: prp.video_title,
                channel_title: prp.channel_title,
                created_by: prp.created_by,
                prp_id: prp.id,
              }
            );
          } else {
            return createErrorResponse(
              "PRP already synced to Notion",
              { 
                notion_page_id: notionPageId,
                hint: "Use update_existing=true to update the existing page" 
              }
            );
          }

          // Update sync status in database
          await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
            await db`
              UPDATE parsed_prps 
              SET 
                notion_page_id = ${notionPageId},
                notion_sync_status = 'synced',
                notion_synced_at = NOW(),
                notion_sync_error = NULL
              WHERE id = ${prp_id}
            `;
          });

        } catch (error) {
          syncStatus = 'failed';
          syncError = error instanceof Error ? error.message : String(error);
          
          // Update sync error in database
          await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
            await db`
              UPDATE parsed_prps 
              SET 
                notion_sync_status = 'failed',
                notion_sync_error = ${syncError}
              WHERE id = ${prp_id}
            `;
          });
          
          throw error;
        }

        // Prepare response
        const response: NotionSyncResponse = {
          notion_page_id: notionPageId!,
          notion_page_url: `https://notion.so/${notionPageId!.replace(/-/g, '')}`,
          sync_status: syncStatus,
          error: syncError,
        };

        return createSuccessResponse(
          `Successfully synced PRP "${prpContent.name}" to Notion`,
          response
        );

      } catch (error) {
        console.error(`Error syncing to Notion: ${error}`);
        return createErrorResponse(
          "Failed to sync PRP to Notion",
          { 
            error: formatDatabaseError(error),
            prp_id,
            database_id 
          }
        );
      }
    }
  );

  // Tool: Check Notion Sync Status
  server.tool(
    "checkNotionSyncStatus",
    "Check the Notion sync status for one or more PRPs",
    {
      prp_ids: z.array(z.string().uuid()).optional().describe("List of PRP IDs to check (omit for all)"),
      sync_status: z.enum(['not_synced', 'syncing', 'synced', 'failed']).optional().describe("Filter by sync status"),
    },
    async ({ prp_ids, sync_status }) => {
      try {
        const results = await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
          // Build WHERE conditions
          const conditions: string[] = [];
          const params: any[] = [];

          if (prp_ids && prp_ids.length > 0) {
            conditions.push(`id = ANY($${params.length + 1})`);
            params.push(prp_ids);
          }

          if (sync_status) {
            conditions.push(`notion_sync_status = $${params.length + 1}`);
            params.push(sync_status);
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

          const queryText = `
            SELECT 
              id,
              video_title,
              parsed_content->>'name' as prp_name,
              notion_sync_status,
              notion_page_id,
              notion_synced_at,
              notion_sync_error
            FROM parsed_prps
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT 50
          `;

          return await db.unsafe(queryText, params);
        });

        const summary = {
          total: results.length,
          synced: results.filter(r => r.notion_sync_status === 'synced').length,
          failed: results.filter(r => r.notion_sync_status === 'failed').length,
          not_synced: results.filter(r => r.notion_sync_status === 'not_synced').length,
        };

        return createSuccessResponse(
          `Found ${results.length} PRPs`,
          { summary, results }
        );

      } catch (error) {
        console.error(`Error checking Notion sync status: ${error}`);
        return createErrorResponse(
          "Failed to check Notion sync status",
          { error: formatDatabaseError(error) }
        );
      }
    }
  );
}

import { z } from "zod";