# Examples for YouTube-Notion MCP Server

This directory contains code examples and patterns to follow when implementing new features for the YouTube-Notion MCP server.

## Directory Structure

```
examples/
├── README.md                    # This file
├── mcp-tools/                   # MCP tool implementation patterns
│   ├── basic-tool.ts           # Simple MCP tool example
│   ├── youtube-tool.ts         # YouTube API integration tool
│   ├── notion-tool.ts          # Notion API integration tool
│   └── integration-tool.ts     # Combined YouTube-Notion tool
├── services/                    # Service layer patterns
│   ├── api-service.ts          # Generic API service pattern
│   ├── youtube-patterns.ts     # YouTube API usage patterns
│   └── notion-patterns.ts      # Notion API usage patterns
├── utils/                       # Utility patterns
│   ├── validation-patterns.ts  # Input validation examples
│   ├── error-handling.ts       # Error handling patterns
│   └── logging-patterns.ts     # Logging best practices
└── tests/                       # Testing patterns
    ├── mcp-tool.test.ts        # MCP tool testing patterns
    ├── service.test.ts         # Service testing patterns
    └── integration.test.ts     # Integration testing patterns
```

## How to Use These Examples

### 1. MCP Tool Implementation
Look at `mcp-tools/` for patterns on:
- Tool registration and schema definition
- Parameter validation
- Error handling
- Result formatting
- Integration with existing services

### 2. Service Layer Patterns
Check `services/` for:
- API client implementation
- Error handling and retries
- Rate limiting
- Response transformation
- Caching strategies

### 3. Utility Patterns
Reference `utils/` for:
- Input validation techniques
- Security best practices
- Logging strategies
- Configuration management

### 4. Testing Patterns
Use `tests/` for:
- Unit testing strategies
- Mocking external APIs
- Integration testing
- Error scenario testing

## Key Patterns to Follow

### MCP Tool Registration
```typescript
// Follow this pattern for all MCP tools
const toolSchema = z.object({
  parameter: z.string().describe("Parameter description"),
});

server.addTool({
  name: "tool_name",
  description: "Tool description",
  inputSchema: zodToJsonSchema(toolSchema),
  handler: async (params) => {
    // Implementation
  },
});
```

### Service Usage
```typescript
// Always use existing service classes
const youtubeService = new YouTubeService();
const notionService = new NotionService();

// Handle errors gracefully
try {
  const result = await youtubeService.searchVideos(params);
  return result;
} catch (error) {
  logger.error('Operation failed', error);
  throw new Error('User-friendly error message');
}
```

### Input Validation
```typescript
// Validate all inputs before processing
const validated = validateInput(params);
if (!validated.success) {
  throw new Error(`Invalid input: ${validated.error}`);
}
```

## Best Practices

1. **Always use existing service classes** - Don't create new API clients
2. **Validate all inputs** - Use existing validation utilities
3. **Handle errors gracefully** - Provide user-friendly error messages
4. **Log appropriately** - Use structured logging for debugging
5. **Test thoroughly** - Include success and failure scenarios
6. **Follow TypeScript patterns** - Use proper type definitions
7. **Implement proper monitoring** - Use Sentry for error tracking

## Example Usage

When implementing a new feature:

1. **Study relevant examples** in this directory
2. **Copy and modify patterns** rather than starting from scratch
3. **Follow the established conventions** for naming and structure
4. **Test your implementation** using the test patterns
5. **Update documentation** when adding new patterns

## Contributing

When adding new examples:
- Follow the existing directory structure
- Include comprehensive comments
- Add both success and error scenarios
- Update this README with new patterns
- Ensure examples work with the current codebase
