import { describe, it, expect, beforeAll, vi } from 'vitest';
import { extractVideoId } from '../../lib/youtube-client';

describe('YouTube Tools', () => {
  describe('extractVideoId', () => {
    it('should extract video ID from standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from shortened YouTube URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should throw error for invalid YouTube URL', () => {
      const url = 'https://example.com/video';
      expect(() => extractVideoId(url)).toThrow('Invalid YouTube URL format');
    });
  });

  // TODO: Add more comprehensive tests for:
  // - YouTubeClient.getVideoMetadata
  // - YouTubeClient.getVideoTranscript
  // - parseYoutubePRP tool
  // These would require mocking the YouTube API responses
});