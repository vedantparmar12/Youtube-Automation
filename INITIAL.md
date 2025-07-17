## FEATURE:

[Insert your YouTube-Notion MCP server feature here]

## EXAMPLES:

[Provide and explain examples from the existing codebase that demonstrate patterns to follow]

### Existing Patterns to Reference:
- `src/services/YouTubeService.ts` - YouTube API integration patterns
- `src/services/NotionService.ts` - Notion API integration patterns
- `src/services/YouTubeNotionIntegration.ts` - Integration service patterns
- `src/tools/tools-sentry.ts` - MCP tool registration with Sentry monitoring
- `src/auth/github-handler.ts` - Authentication patterns
- `src/utils/validation.ts` - Input validation patterns
- `src/utils/security.ts` - Security implementation patterns
- `src/utils/logger.ts` - Logging patterns

## DOCUMENTATION:

[List documentation that will be referenced during development]

### Required Documentation:
- **MCP SDK**: https://github.com/modelcontextprotocol/sdk - Tool registration and execution patterns
- **YouTube Data API v3**: https://developers.google.com/youtube/v3 - API endpoints and authentication
- **Notion API**: https://developers.notion.com/docs - Database operations and page management
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/ - Deployment and runtime patterns
- **TypeScript**: https://www.typescriptlang.org/docs/ - Type safety and best practices
- **Vitest**: https://vitest.dev/ - Testing framework for validation

## OTHER CONSIDERATIONS:

[Any other considerations or specific requirements - include common pitfalls for MCP server development]

### MCP Server Specific Considerations:
- **Authentication**: Ensure proper OAuth flow integration with existing GitHub authentication
- **Rate Limiting**: Implement proper rate limiting for YouTube and Notion API calls
- **Error Handling**: Use existing error handling patterns and Sentry integration
- **Input Validation**: Validate all user inputs using existing validation utilities
- **Security**: Follow existing security patterns for API key management
- **Testing**: Create comprehensive tests for both success and failure scenarios
- **Monitoring**: Include proper logging and monitoring for production deployment
- **Performance**: Consider caching strategies for frequently accessed data
- **Deployment**: Ensure compatibility with Cloudflare Workers runtime limitations
