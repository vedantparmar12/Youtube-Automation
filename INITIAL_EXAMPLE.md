## FEATURE:

Create an advanced YouTube playlist to Notion database sync tool that automatically imports entire YouTube playlists into Notion with metadata enrichment, thumbnail handling, and automatic categorization.

## EXAMPLES:

### Existing Patterns to Reference:
- `src/services/YouTubeService.ts` - Use `searchVideos()` and `getVideoDetails()` methods for playlist video retrieval
- `src/services/NotionService.ts` - Use `createPage()` method for individual video entries
- `src/services/YouTubeNotionIntegration.ts` - Follow existing integration patterns for API orchestration
- `src/tools/tools-sentry.ts` - Use MCP tool registration pattern with proper error handling and monitoring
- `src/auth/github-handler.ts` - Follow OAuth authentication patterns for user permissions
- `src/utils/validation.ts` - Use existing validation patterns for playlist URL validation
- `src/utils/security.ts` - Apply security patterns for API key handling and rate limiting
- `src/utils/logger.ts` - Use structured logging for sync progress and error tracking

### New Patterns to Implement:
- Batch processing for large playlists (chunked API calls)
- Progress tracking for long-running sync operations
- Duplicate detection and handling
- Thumbnail download and storage optimization

## DOCUMENTATION:

### Required Documentation:
- **MCP SDK**: https://github.com/modelcontextprotocol/sdk - For tool registration and execution patterns
- **YouTube Data API v3**: https://developers.google.com/youtube/v3/docs/playlists - Playlist endpoints and pagination
- **YouTube Data API v3**: https://developers.google.com/youtube/v3/docs/playlistItems - Playlist items retrieval
- **Notion API**: https://developers.notion.com/docs/working-with-databases - Database operations and property handling
- **Notion API**: https://developers.notion.com/reference/create-a-page - Page creation with rich properties
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/runtime-apis/kv/ - For caching and state management
- **TypeScript**: https://www.typescriptlang.org/docs/handbook/advanced-types.html - For complex type definitions
- **Vitest**: https://vitest.dev/guide/mocking.html - For mocking external API calls in tests

## OTHER CONSIDERATIONS:

### MCP Server Specific Considerations:
- **Playlist Size Limits**: YouTube playlists can contain thousands of videos - implement pagination and chunked processing
- **Rate Limiting**: YouTube API has strict quota limits - implement exponential backoff and request batching
- **Duplicate Handling**: Check existing Notion entries to avoid duplicates using video IDs
- **Error Recovery**: Handle partial failures gracefully and allow resume functionality
- **Progress Reporting**: Provide real-time progress updates during long sync operations
- **Thumbnail Management**: Optimize thumbnail storage and display in Notion
- **Metadata Enrichment**: Extract and store additional metadata like tags, categories, and duration
- **Authentication**: Ensure proper OAuth flow integration with existing GitHub authentication
- **Security**: Validate playlist URLs and sanitize all inputs before processing
- **Performance**: Implement caching for frequently accessed playlist data
- **Monitoring**: Include comprehensive logging for sync operations and error tracking
- **Testing**: Create tests for various playlist sizes and edge cases (private playlists, deleted videos)
- **Deployment**: Ensure compatibility with Cloudflare Workers timeout limitations for long-running operations
