// YouTube API Types
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  categoryId: string;
  defaultLanguage?: string;
  url: string;
}

export interface YouTubeSearchResult {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  url: string;
}

export interface YouTubeSearchParams {
  query: string;
  maxResults: number;
  order: 'relevance' | 'date' | 'rating' | 'title' | 'viewCount';
}

// Notion API Types
export interface NotionPage {
  id: string;
  title: string;
  url: string;
  createdTime: string;
  lastEditedTime: string;
  properties: Record<string, any>;
  content?: string;
}

export interface NotionCreatePageParams {
  title: string;
  content?: string;
  properties?: Record<string, any>;
}

export interface NotionListPagesParams {
  filter?: any;
  sorts?: any[];
  pageSize?: number;
}

// Tool Arguments Types
export interface SearchYouTubeVideosArgs {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'rating' | 'title' | 'viewCount';
}

export interface GetYouTubeVideoDetailsArgs {
  videoId: string;
}

export interface CreateNotionPageArgs {
  title: string;
  content?: string;
  properties?: Record<string, any>;
}

export interface SaveVideoToNotionArgs {
  videoId: string;
  customTitle?: string;
  notes?: string;
  tags?: string[];
}

export interface ListNotionPagesArgs {
  filter?: any;
  sorts?: any[];
  pageSize?: number;
}

// Environment Types
export interface Env {
  YOUTUBE_API_KEY: string;
  NOTION_API_KEY: string;
  NOTION_DATABASE_ID: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  SENTRY_DSN?: string;
  ENVIRONMENT?: string;
  OAUTH_KV: KVNamespace;
  MCP_OBJECT: DurableObjectNamespace;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
}

// Auth Types
export interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  provider: string;
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Database Types (for future use)
export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

// Configuration Types
export interface ServerConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigins: string[];
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface SecurityConfig {
  jwtSecret: string;
  sessionTimeout: number;
  passwordMinLength: number;
  encryptionKey: string;
}
