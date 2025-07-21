import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Props, createSuccessResponse, createErrorResponse } from "../types";
import { z } from "zod";
import { 
  ListParsedPRPsSchema,
  GetPRPDetailsSchema,
  ExtractTasksSchema,
  UpdateTaskStatusSchema,
  PRPSummary,
  ParsedPRP,
  PRPTask,
  DatabasePRPRow,
  DatabaseTaskRow
} from "../../types/prp-types";
import { GeminiClient } from "../../lib/gemini-client";
import { withDatabase } from "../database/utils";
import { formatDatabaseError } from "../database/security";
import postgres from "postgres";

// Allowed users for write operations
const ALLOWED_USERNAMES = new Set<string>(['coleam00', 'vedantparmar12']);

export function registerPRPTools(server: McpServer, env: Env, props: Props) {
  // Tool: List Parsed PRPs
  server.tool(
    "listParsedPRPs",
    "List all previously parsed PRPs with filtering and pagination options",
    {
      created_by: z.string().optional().describe('Filter by GitHub username'),
      sync_status: z.enum(['not_synced', 'syncing', 'synced', 'failed']).optional().describe('Filter by Notion sync status'),
      limit: z.number().int().positive().max(100).default(20).describe('Maximum number of results'),
      offset: z.number().int().min(0).default(0).describe('Offset for pagination'),
    },
    async ({ created_by, sync_status, limit, offset }) => {
      try {
        const results = await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
          // Build WHERE conditions
          const conditions: string[] = [];
          const params: any[] = [];

          if (created_by) {
            conditions.push(`created_by = $${params.length + 1}`);
            params.push(created_by);
          }

          if (sync_status) {
            conditions.push(`notion_sync_status = $${params.length + 1}`);
            params.push(sync_status);
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

          // Get total count
          const countQuery = `
            SELECT COUNT(*) as count
            FROM prp_summaries
            ${whereClause}
          `;
          const [{ count }] = await db.unsafe(countQuery, params);

          // Get paginated results
          const rowsQuery = `
            SELECT *
            FROM prp_summaries
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${params.length + 1}
            OFFSET $${params.length + 2}
          `;
          const rows = await db.unsafe<PRPSummary[]>(rowsQuery, [...params, limit, offset]);

          return { rows, total: parseInt(count) };
        });

        const hasMore = offset + limit < results.total;

        return createSuccessResponse(
          `Found ${results.total} PRPs (showing ${results.rows.length})`,
          {
            total: results.total,
            limit,
            offset,
            hasMore,
            prps: results.rows.map(row => ({
              id: row.id,
              name: row.prp_name,
              description: row.prp_description,
              video_title: row.video_title,
              channel: row.channel_title,
              created_by: row.created_by,
              created_at: row.created_at,
              tasks: {
                total: row.total_tasks,
                completed: row.completed_tasks,
                in_progress: row.in_progress_tasks,
                pending: row.pending_tasks,
              },
              notion: {
                status: row.notion_sync_status,
                page_id: row.notion_page_id,
              }
            }))
          }
        );

      } catch (error) {
        console.error(`Error listing PRPs: ${error}`);
        return createErrorResponse(
          "Failed to list parsed PRPs",
          { error: formatDatabaseError(error) }
        );
      }
    }
  );

  // Tool: Get PRP Details
  server.tool(
    "getPRPDetails",
    "Get detailed information about a specific parsed PRP including tasks",
    {
      prp_id: z.string().uuid().describe('UUID of the parsed PRP'),
      include_tasks: z.boolean().default(true).describe('Include tasks in response'),
    },
    async ({ prp_id, include_tasks }) => {
      try {
        const result = await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
          // Get PRP details
          const [prp] = await db<DatabasePRPRow[]>`
            SELECT * FROM parsed_prps WHERE id = ${prp_id}
          `;

          if (!prp) {
            throw new Error(`PRP not found: ${prp_id}`);
          }

          // Get tasks if requested
          let tasks: DatabaseTaskRow[] = [];
          if (include_tasks) {
            tasks = await db<DatabaseTaskRow[]>`
              SELECT * FROM prp_tasks 
              WHERE prp_id = ${prp_id}
              ORDER BY order_num ASC
            `;
          }

          return { prp, tasks };
        });

        // Parse the stored JSON content
        const prpContent = typeof result.prp.parsed_content === 'string' 
          ? JSON.parse(result.prp.parsed_content)
          : result.prp.parsed_content;

        const response = {
          id: result.prp.id,
          youtube_url: result.prp.youtube_url,
          video: {
            id: result.prp.video_id,
            title: result.prp.video_title,
            description: result.prp.video_description,
            channel: result.prp.channel_title,
            published_at: result.prp.published_at,
            duration: result.prp.duration,
          },
          prp: prpContent,
          tasks: include_tasks ? result.tasks.map(task => ({
            id: task.id,
            order: task.order_num,
            title: task.title,
            description: task.description,
            type: task.type,
            file_path: task.file_path,
            pseudocode: task.pseudocode,
            status: task.status,
            completed_at: task.completed_at,
            completed_by: task.completed_by,
          })) : undefined,
          metadata: {
            created_by: result.prp.created_by,
            created_at: result.prp.created_at,
            updated_at: result.prp.updated_at,
            notion_sync_status: result.prp.notion_sync_status,
            notion_page_id: result.prp.notion_page_id,
            notion_synced_at: result.prp.notion_synced_at,
          }
        };

        return createSuccessResponse(
          `Retrieved PRP: "${prpContent.name}"`,
          response
        );

      } catch (error) {
        console.error(`Error getting PRP details: ${error}`);
        return createErrorResponse(
          "Failed to get PRP details",
          { error: formatDatabaseError(error), prp_id }
        );
      }
    }
  );

  // Tool: Extract Additional Tasks
  server.tool(
    "extractTasks",
    "Extract additional implementation tasks from a parsed PRP using AI",
    {
      prp_id: z.string().uuid().describe('UUID of the parsed PRP'),
      max_tasks: z.number().int().positive().max(100).default(20).describe('Maximum number of tasks to extract'),
    },
    async ({ prp_id, max_tasks }) => {
      try {
        // Check permissions for write operations
        if (!ALLOWED_USERNAMES.has(props.login)) {
          return createErrorResponse(
            "Insufficient permissions to extract tasks",
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

        // Initialize Gemini client
        const gemini = new GeminiClient(
          env.GEMINI_API_KEY,
          env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
        );

        // Extract additional tasks
        console.log(`Extracting up to ${max_tasks} tasks for PRP: ${prp_id}`);
        const newTasks = await gemini.extractTasks(prpContent, max_tasks);

        // Store new tasks in database
        const storedTasks = await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
          const taskValues = newTasks.map((task, index) => ({
            prp_id: prp_id,
            order_num: (prpContent.tasks?.length || 0) + index + 1,
            title: task.title,
            description: task.description,
            type: task.type,
            file_path: task.file_path || null,
            pseudocode: task.pseudocode || null,
            status: 'pending'
          }));

          const inserted = await db<DatabaseTaskRow[]>`
            INSERT INTO prp_tasks ${db(taskValues)}
            RETURNING *
          `;

          return inserted;
        });

        console.log(`Successfully extracted ${storedTasks.length} new tasks`);

        return createSuccessResponse(
          `Extracted ${storedTasks.length} new tasks for PRP "${prpContent.name}"`,
          {
            prp_id,
            prp_name: prpContent.name,
            new_task_count: storedTasks.length,
            total_task_count: (prpContent.tasks?.length || 0) + storedTasks.length,
            tasks: storedTasks.map(task => ({
              id: task.id,
              order: task.order_num,
              title: task.title,
              description: task.description,
              type: task.type,
              status: task.status,
            }))
          }
        );

      } catch (error) {
        console.error(`Error extracting tasks: ${error}`);
        return createErrorResponse(
          "Failed to extract additional tasks",
          { error: formatDatabaseError(error), prp_id }
        );
      }
    }
  );

  // Tool: Update Task Status (for privileged users)
  if (ALLOWED_USERNAMES.has(props.login)) {
    server.tool(
      "updateTaskStatus",
      "Update the status of a PRP task",
      {
      task_id: z.string().uuid().describe('UUID of the task'),
      status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).describe('New status'),
    },
      async ({ task_id, status }) => {
        try {
          const result = await withDatabase(env.DATABASE_URL, async (db: postgres.Sql) => {
            const [task] = await db<DatabaseTaskRow[]>`
              UPDATE prp_tasks
              SET 
                status = ${status},
                updated_at = NOW()
                ${status === 'completed' ? db`, completed_at = NOW(), completed_by = ${props.login}` : db``}
              WHERE id = ${task_id}
              RETURNING *
            `;

            if (!task) {
              throw new Error(`Task not found: ${task_id}`);
            }

            // Get PRP info for response
            const [prp] = await db`
              SELECT id, parsed_content->>'name' as name
              FROM parsed_prps
              WHERE id = ${task.prp_id}
            `;

            return { task, prp };
          });

          return createSuccessResponse(
            `Updated task status to "${status}"`,
            {
              task_id,
              task_title: result.task.title,
              new_status: status,
              prp_id: result.task.prp_id,
              prp_name: result.prp.name,
              updated_by: props.login,
            }
          );

        } catch (error) {
          console.error(`Error updating task status: ${error}`);
          return createErrorResponse(
            "Failed to update task status",
            { error: formatDatabaseError(error), task_id }
          );
        }
      }
    );
  }
}