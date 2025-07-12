import { logger } from './logger.js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate YouTube video ID format
 */
export function validateYouTubeVideoId(videoId: string): ValidationResult {
  if (!videoId || typeof videoId !== 'string') {
    return { isValid: false, error: 'Video ID is required and must be a string' };
  }

  // YouTube video IDs are 11 characters long and contain letters, numbers, hyphens, and underscores
  const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/;
  
  if (!youtubeIdPattern.test(videoId)) {
    return { isValid: false, error: 'Invalid YouTube video ID format' };
  }

  return { isValid: true };
}

/**
 * Validate search query to prevent injection attacks
 */
export function validateSearchQuery(query: string): ValidationResult {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Search query is required and must be a string' };
  }

  // Remove excessive whitespace
  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length === 0) {
    return { isValid: false, error: 'Search query cannot be empty' };
  }

  if (trimmedQuery.length > 500) {
    return { isValid: false, error: 'Search query is too long (max 500 characters)' };
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\beval\s*\(/i,
    /\bdocument\./i,
    /\bwindow\./i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedQuery)) {
      return { isValid: false, error: 'Search query contains potentially dangerous content' };
    }
  }

  return { isValid: true };
}

/**
 * Validate Notion page title
 */
export function validateNotionTitle(title: string): ValidationResult {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'Title is required and must be a string' };
  }

  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length === 0) {
    return { isValid: false, error: 'Title cannot be empty' };
  }

  if (trimmedTitle.length > 2000) {
    return { isValid: false, error: 'Title is too long (max 2000 characters)' };
  }

  return { isValid: true };
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate API key format (basic validation)
 */
export function validateApiKey(apiKey: string, keyName: string): ValidationResult {
  if (!apiKey || typeof apiKey !== 'string') {
    return { isValid: false, error: `${keyName} is required` };
  }

  if (apiKey.length < 10) {
    return { isValid: false, error: `${keyName} appears to be too short` };
  }

  if (apiKey.includes(' ')) {
    return { isValid: false, error: `${keyName} should not contain spaces` };
  }

  return { isValid: true };
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      logger.warn('Rate limit exceeded', { identifier, requests: validRequests.length });
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

/**
 * Format error for user-friendly display while hiding sensitive information
 */
export function formatSecureError(error: unknown): string {
  if (error instanceof Error) {
    // Hide sensitive information from error messages
    const message = error.message;
    
    if (message.includes('api key') || message.includes('token')) {
      return 'Authentication failed. Please check your API credentials.';
    }
    
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    if (message.includes('network') || message.includes('connection')) {
      return 'Network error occurred. Please check your connection.';
    }
    
    if (message.includes('rate limit')) {
      return 'Rate limit exceeded. Please wait before making more requests.';
    }
    
    // Return sanitized error message
    return sanitizeHtml(message);
  }
  
  return 'An unexpected error occurred. Please try again.';
}
