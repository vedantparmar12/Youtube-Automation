import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Props, createSuccessResponse, createErrorResponse } from "../types";
import { z } from "zod";
import { 
  ParseYoutubePRPSchema, 
  ParsedPRP, 
  ParseYoutubePRPResponse,
  DatabasePRPRow,
  DatabaseTaskRow
} from "../../types/prp-types";
import { YouTubeClient, extractVideoId } from "../../lib/youtube-client";
import { GeminiClient } from "../../lib/gemini-client";
import { NotionClient } from "../../lib/notion-client";
import { withDatabase } from "../database/utils";
import { formatDatabaseError } from "../database/security";
import postgres from "postgres";

export function registerYouTubeTools(server: McpServer, env: Env, props: Props) {
  // Tool: Parse YouTube PRP
  server.tool(
    "parseYoutubePRP",
    "Parse a Product Requirements Prompt (PRP) from a YouTube video URL using AI to extract structured information",
    {
      youtube_url: z.string().url().refine(
        (url) => url.includes('youtube.com') || url.includes('youtu.be'),
        'Must be a valid YouTube URL'
      ).describe('YouTube video URL to parse'),
      notion_database_id: z.string().optional().describe('Notion database ID to sync to (optional)'),
      auto_sync: z.boolean().default(false).describe('Automatically sync to Notion after parsing'),
    },
    async ({ youtube_url, notion_database_id, auto_sync }) => {
      try {
        // Extract video ID from URL
        let videoId: string;
        try {
          videoId = extractVideoId(youtube_url);
        } catch (error) {
          return createErrorResponse(
            "Invalid YouTube URL format",
            { url: youtube_url, error: error instanceof Error ? error.message : String(error) }
          );
        }

        // Initialize clients
        const youtube = new YouTubeClient(env.YOUTUBE_API_KEY);
        const gemini = new GeminiClient(
          env.GEMINI_API_KEY,
          env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
        );

        // Fetch video metadata
        console.log(`Fetching metadata for video: ${videoId}`);
        const metadata = await youtube.getVideoMetadata(videoId);

        // Get video transcript (with fallback to description)
        console.log(`Fetching transcript for video: ${videoId}`);
        const transcript = await youtube.getVideoTranscript(videoId);

        // Parse PRP content using AI
        console.log(`Parsing PRP content with AI for video: ${metadata.title}`);
        const prpContent = await gemini.parsePRPContent(transcript, metadata);

        // Store in database
        const prp = await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
          // Insert the parsed PRP
          const [prpRow] = await db<DatabasePRPRow[]>`
            INSERT INTO parsed_prps (
              youtube_url, 
              video_id,
              video_title, 
              video_description, 
              channel_title,
              published_at,
              duration,
              transcript, 
              parsed_content, 
              created_by
            ) VALUES (
              ${youtube_url}, 
              ${videoId},
              ${metadata.title}, 
              ${metadata.description},
              ${metadata.channelTitle},
              ${metadata.publishedAt},
              ${metadata.duration},
              ${transcript}, 
              ${JSON.stringify(prpContent)}, 
              ${props.login}
            ) RETURNING *
          `;

          // Insert tasks
          if (prpContent.tasks && prpContent.tasks.length > 0) {
            const taskValues = prpContent.tasks.map((task, index) => ({
              prp_id: prpRow.id,
              order_num: index + 1,
              title: task.title,
              description: task.description,
              type: task.type,
              file_path: task.file_path || null,
              pseudocode: task.pseudocode || null,
              status: 'pending'
            }));

            await db`
              INSERT INTO prp_tasks ${db(taskValues)}
            `;
          }

          return prpRow;
        });

        console.log(`Successfully parsed PRP: ${prp.id}`);

        // Auto-sync to Notion if requested
        let notionPageId: string | undefined;
        let syncStatus = 'not_synced';

        if (auto_sync && notion_database_id) {
          try {
            console.log(`Auto-syncing to Notion database: ${notion_database_id}`);
            const notion = new NotionClient(env.NOTION_TOKEN);
            
            notionPageId = await notion.createDatabasePage(
              notion_database_id,
              prpContent,
              {
                youtube_url,
                video_title: metadata.title,
                channel_title: metadata.channelTitle,
                created_by: props.login,
                prp_id: prp.id,
              }
            );

            // Update sync status in database
            await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
              await db`
                UPDATE parsed_prps 
                SET 
                  notion_page_id = ${notionPageId},
                  notion_sync_status = 'synced',
                  notion_synced_at = NOW()
                WHERE id = ${prp.id}
              `;
            });

            syncStatus = 'synced';
            console.log(`Successfully synced to Notion: ${notionPageId}`);
          } catch (error) {
            console.error(`Failed to sync to Notion: ${error}`);
            
            // Update sync error in database
            await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
              await db`
                UPDATE parsed_prps 
                SET 
                  notion_sync_status = 'failed',
                  notion_sync_error = ${error instanceof Error ? error.message : String(error)}
                WHERE id = ${prp.id}
              `;
            });

            syncStatus = 'failed';
          }
        }

        // Prepare response
        const response: ParseYoutubePRPResponse = {
          prp_id: prp.id,
          prp_name: prpContent.name,
          video_title: metadata.title,
          channel_title: metadata.channelTitle,
          task_count: prpContent.tasks?.length || 0,
          notion_page_id: notionPageId,
          sync_status: syncStatus,
        };

        return createSuccessResponse(
          `Parsed PRP from YouTube video: "${metadata.title}"`,
          response
        );

      } catch (error) {
        console.error(`Error parsing YouTube PRP: ${error}`);
        return createErrorResponse(
          "Failed to parse YouTube PRP",
          { 
            error: formatDatabaseError(error),
            url: youtube_url 
          }
        );
      }
    }
  );
}