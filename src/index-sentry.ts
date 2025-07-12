import * as Sentry from '@sentry/cloudflare';
import OAuthProvider from '@cloudflare/workers-oauth-provider';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { YouTubeNotionIntegration } from './services/YouTubeNotionIntegration.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { validateEnvironment } from './utils/validation.js';
import { GitHubHandler } from './auth/github-handler.js';
import { registerToolsWithSentry } from './tools/tools-sentry.js';
import { formatSecureError } from './utils/security.js';

// Sentry configuration helper
function getSentryConfig(env: Env) {
  return {
    // You can disable Sentry by setting SENTRY_DSN to a falsey-value
    dsn: (env as any).SENTRY_DSN,
    // A sample rate of 1.0 means "capture all traces"
    tracesSampleRate: 1,
    environment: env.ENVIRONMENT || 'development',
    beforeSend(event: any) {
      // Filter out sensitive information from error reports
      if (event.exception) {
        event.exception.values.forEach((exception: any) => {
          if (exception.value) {
            exception.value = formatSecureError(new Error(exception.value));
          }
        });
      }
      return event;
    },
  };
}

export class YouTubeNotionMCP extends McpAgent<Env, Record<string, never>, any> {
  server = new McpServer({
    name: 'YouTube-Notion MCP Server',
    version: '1.0.0',
  });

  private integration: YouTubeNotionIntegration;

  constructor() {
    super();
    this.integration = new YouTubeNotionIntegration();
  }

  /**
   * Cleanup resources when Durable Object is shutting down
   */
  async cleanup(): Promise<void> {
    try {
      // Cleanup any resources here
      logger.info('YouTube-Notion MCP Server cleanup completed');
    } catch (error) {
      logger.error('Error during cleanup:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Durable Objects alarm handler - used for cleanup
   */
  async alarm(): Promise<void> {
    await this.cleanup();
  }

  async init() {
    try {
      // Validate environment variables
      validateEnvironment();

      // Initialize Sentry
      const sentryConfig = getSentryConfig(this.env);
      if (sentryConfig.dsn) {
        Sentry.init(sentryConfig);
        logger.info('Sentry initialized successfully');
      }

      // Register all tools with Sentry instrumentation
      registerToolsWithSentry(this.server, this.integration);

      logger.info('YouTube-Notion MCP Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize server:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  /**
   * Handle incoming requests with error tracking
   */
  async handleRequest(request: Request, env: Env): Promise<Response> {
    try {
      return await super.handleRequest(request, env);
    } catch (error) {
      logger.error('Request handling error:', error);
      Sentry.captureException(error);
      
      return new Response(
        JSON.stringify({
          error: formatSecureError(error),
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  }
}

// Export the OAuth provider with our MCP server
export default new OAuthProvider({
  apiHandlers: {
    '/sse': YouTubeNotionMCP.serveSSE('/sse') as any,
    '/mcp': YouTubeNotionMCP.serve('/mcp') as any,
  },
  authorizeEndpoint: '/authorize',
  clientRegistrationEndpoint: '/register',
  defaultHandler: GitHubHandler as any,
  tokenEndpoint: '/token',
});
