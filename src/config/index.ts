import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  youtube: z.object({
    apiKey: z.string().min(1, 'YouTube API key is required'),
  }),
  notion: z.object({
    apiKey: z.string().min(1, 'Notion API key is required'),
    databaseId: z.string().min(1, 'Notion database ID is required'),
  }),
  server: z.object({
    port: z.number().default(3000),
    nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  }),
  auth: z.object({
    secret: z.string().optional(),
    allowedOrigins: z.array(z.string()).optional(),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    format: z.enum(['json', 'pretty']).default('json'),
  }),
});

export type Config = z.infer<typeof configSchema>;

export const config: Config = {
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
  },
  notion: {
    apiKey: process.env.NOTION_API_KEY || '',
    databaseId: process.env.NOTION_DATABASE_ID || '',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  },
  auth: {
    secret: process.env.AUTH_SECRET,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
  },
  logging: {
    level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
    format: (process.env.LOG_FORMAT as 'json' | 'pretty') || 'json',
  },
};

// Validate configuration
export function validateConfig(): void {
  try {
    configSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
      throw new Error(`Configuration validation failed:\n${issues.join('\n')}`);
    }
    throw error;
  }
}
