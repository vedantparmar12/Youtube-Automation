// Extend Cloudflare Env interface with PRP-specific environment variables
declare global {
  interface Env {
    // Existing OAuth and database
    DATABASE_URL: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    COOKIE_ENCRYPTION_KEY: string;
    
    // New API keys for PRP Parser
    YOUTUBE_API_KEY: string;
    NOTION_TOKEN: string;
    GEMINI_API_KEY: string;
    GEMINI_MODEL?: string;
    
    // Optional Sentry
    SENTRY_DSN?: string;
    NODE_ENV?: string;
  }
}

export {};