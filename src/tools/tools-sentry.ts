import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import * as Sentry from '@sentry/cloudflare';
import { logger } from '../utils/logger.js';

/**
 * Register all tools with Sentry instrumentation
 */
export function registerToolsWithSentry(server: Server, integration: any) {
  logger.info('Registering tools with Sentry');
  
  server.setRequestHandler('your-custom-tool', async (request) => {
    try {
      // Process request with integration
      return await integration.processRequest(request);
    } catch (error) {
      logger.error('Tool error detected:', error);
      Sentry.captureException(error);
      throw error;
    }
  });
}
