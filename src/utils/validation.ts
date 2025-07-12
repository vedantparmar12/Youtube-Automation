import { config, validateConfig } from '../config/index.js';
import { logger } from './logger.js';
import { validateApiKey } from './security.js';

/**
 * Validate all required environment variables
 */
export function validateEnvironment(): void {
  logger.info('Validating environment configuration');
  
  try {
    // Validate configuration structure
    validateConfig();
    
    // Validate API keys
    const youtubeValidation = validateApiKey(config.youtube.apiKey, 'YouTube API Key');
    if (!youtubeValidation.isValid) {
      throw new Error(`YouTube API Key validation failed: ${youtubeValidation.error}`);
    }
    
    const notionValidation = validateApiKey(config.notion.apiKey, 'Notion API Key');
    if (!notionValidation.isValid) {
      throw new Error(`Notion API Key validation failed: ${notionValidation.error}`);
    }
    
    if (!config.notion.databaseId) {
      throw new Error('Notion database ID is required');
    }
    
    // Validate server configuration
    if (config.server.port < 1 || config.server.port > 65535) {
      throw new Error('Server port must be between 1 and 65535');
    }
    
    logger.info('Environment validation completed successfully');
  } catch (error) {
    logger.error('Environment validation failed:', error);
    throw error;
  }
}

/**
 * Validate runtime environment for production deployment
 */
export function validateProductionEnvironment(): void {
  logger.info('Validating production environment');
  
  if (config.server.nodeEnv !== 'production') {
    logger.warn('Not running in production mode');
    return;
  }
  
  // Additional production-specific validations
  if (!config.auth.secret) {
    logger.warn('No auth secret configured for production');
  }
  
  if (!config.auth.allowedOrigins || config.auth.allowedOrigins.length === 0) {
    logger.warn('No allowed origins configured for production');
  }
  
  logger.info('Production environment validation completed');
}
