import { z } from 'zod';

// Documentation reference type
export interface DocumentationRef {
  type: 'url' | 'file' | 'docfile';
  path: string;
  why: string;
}

// Main PRP content structure
export interface PRPContent {
  name: string;
  description: string;
  goal: string;
  why: string[];
  what: string;
  success_criteria: string[];
  context: {
    documentation: DocumentationRef[];
    codebase_tree?: string;
    gotchas: string[];
  };
  tasks: PRPTask[];
}

// Individual task within a PRP
export interface PRPTask {
  id: string;
  prp_id: string;
  order: number;
  title: string;
  description: string;
  type: 'create' | 'modify' | 'test' | 'deploy' | 'other';
  file_path?: string;
  pseudocode?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

// Parsed PRP stored in database
export interface ParsedPRP {
  id: string;
  youtube_url: string;
  video_id: string;
  video_title: string;
  video_description: string;
  channel_title: string;
  published_at: Date;
  duration: string;
  transcript: string;
  parsed_content: PRPContent;
  created_by: string; // GitHub username
  created_at: Date;
  updated_at: Date;
  notion_page_id?: string;
  notion_sync_status: 'not_synced' | 'syncing' | 'synced' | 'failed';
  notion_sync_error?: string;
  notion_synced_at?: Date;
}

// PRP summary for list views
export interface PRPSummary {
  id: string;
  youtube_url: string;
  video_title: string;
  channel_title: string;
  created_by: string;
  created_at: Date;
  notion_sync_status: string;
  notion_page_id?: string;
  prp_name: string;
  prp_description: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
}

// Tool input schemas with Zod validation
export const ParseYoutubePRPSchema = z.object({
  youtube_url: z.string().url().refine(
    (url) => url.includes('youtube.com') || url.includes('youtu.be'),
    'Must be a valid YouTube URL'
  ),
  notion_database_id: z.string().optional().describe('Notion database ID to sync to (optional)'),
  auto_sync: z.boolean().default(false).describe('Automatically sync to Notion after parsing'),
});

export const ListParsedPRPsSchema = z.object({
  created_by: z.string().optional().describe('Filter by GitHub username'),
  sync_status: z.enum(['not_synced', 'syncing', 'synced', 'failed']).optional().describe('Filter by Notion sync status'),
  limit: z.number().int().positive().max(100).default(20).describe('Maximum number of results'),
  offset: z.number().int().min(0).default(0).describe('Offset for pagination'),
});

export const GetPRPDetailsSchema = z.object({
  prp_id: z.string().uuid().describe('UUID of the parsed PRP'),
  include_tasks: z.boolean().default(true).describe('Include tasks in response'),
});

export const SyncToNotionSchema = z.object({
  prp_id: z.string().uuid().describe('UUID of the parsed PRP to sync'),
  database_id: z.string().describe('Notion database ID'),
  update_existing: z.boolean().default(false).describe('Update if page already exists'),
});

export const ExtractTasksSchema = z.object({
  prp_id: z.string().uuid().describe('UUID of the parsed PRP'),
  max_tasks: z.number().int().positive().max(100).default(20).describe('Maximum number of tasks to extract'),
});

export const UpdateTaskStatusSchema = z.object({
  task_id: z.string().uuid().describe('UUID of the task'),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).describe('New status'),
});

// Response types for tools
export interface ParseYoutubePRPResponse {
  prp_id: string;
  prp_name: string;
  video_title: string;
  channel_title: string;
  task_count: number;
  notion_page_id?: string;
  sync_status: string;
}

export interface NotionSyncResponse {
  notion_page_id: string;
  notion_page_url: string;
  sync_status: 'synced' | 'failed';
  error?: string;
}

// Error response type
export interface ErrorResponse {
  error: string;
  details?: any;
  event_id?: string; // For Sentry integration
}

// Utility type for database row to ParsedPRP conversion
export type DatabasePRPRow = {
  id: string;
  youtube_url: string;
  video_id: string;
  video_title: string;
  video_description: string | null;
  channel_title: string;
  published_at: string;
  duration: string;
  transcript: string;
  parsed_content: string; // JSON string
  created_by: string;
  created_at: string;
  updated_at: string;
  notion_page_id: string | null;
  notion_sync_status: string;
  notion_sync_error: string | null;
  notion_synced_at: string | null;
};

// Utility type for database row to PRPTask conversion
export type DatabaseTaskRow = {
  id: string;
  prp_id: string;
  order_num: number;
  title: string;
  description: string | null;
  type: string;
  file_path: string | null;
  pseudocode: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  completed_by: string | null;
};