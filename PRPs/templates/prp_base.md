name: "YouTube-Notion MCP Server PRP Template v1.0"
description: |

## Purpose
Template optimized for implementing YouTube-Notion MCP server features with comprehensive context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **MCP Patterns**: Follow established MCP SDK patterns and tool registration

---

## Goal
[What needs to be built - be specific about the MCP tool functionality and integration requirements]

## Why
- [Business value and user impact]
- [Integration with existing YouTube-Notion workflow]
- [Problems this solves and for whom]

## What
[User-visible MCP tool behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcomes for MCP tool functionality]

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://github.com/modelcontextprotocol/sdk
  why: MCP SDK patterns for tool registration and execution
  
- url: https://developers.google.com/youtube/v3
  why: YouTube Data API v3 endpoints and authentication
  
- url: https://developers.notion.com/docs
  why: Notion API database operations and page management
  
- file: src/services/YouTubeService.ts
  why: Existing YouTube API integration patterns
  
- file: src/services/NotionService.ts
  why: Existing Notion API integration patterns
  
- file: src/services/YouTubeNotionIntegration.ts
  why: Integration service patterns to follow
  
- file: src/tools/tools-sentry.ts
  why: MCP tool registration with monitoring
  
- file: src/auth/github-handler.ts
  why: Authentication patterns
  
- file: src/utils/validation.ts
  why: Input validation patterns
  
- file: src/utils/security.ts
  why: Security implementation patterns
  
- file: src/utils/logger.ts
  why: Structured logging patterns
```

### Current Codebase Tree
```bash
src/
├── auth/
│   └── github-handler.ts       # OAuth authentication
├── config/
│   └── index.ts               # Configuration management
├── services/
│   ├── YouTubeService.ts      # YouTube API integration
│   ├── NotionService.ts       # Notion API integration
│   └── YouTubeNotionIntegration.ts  # Integration service
├── tools/
│   └── tools-sentry.ts        # MCP tools with monitoring
├── types/
│   └── index.ts               # TypeScript type definitions
├── utils/
│   ├── logger.ts              # Structured logging
│   ├── security.ts            # Security utilities
│   └── validation.ts          # Input validation
├── index.ts                   # Main MCP server
└── index-sentry.ts           # MCP server with Sentry
```

### Desired Codebase Tree
```bash
# Add files to be created here
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: MCP tools must be properly registered with the server
// CRITICAL: YouTube API has quota limits - implement rate limiting
// CRITICAL: Notion API requires proper property type handling
// CRITICAL: Cloudflare Workers have runtime limitations
// CRITICAL: All inputs must be validated before API calls
// CRITICAL: Use existing service classes for API interactions
// CRITICAL: Follow existing authentication patterns
// CRITICAL: Include comprehensive error handling
```

## Implementation Blueprint

### Data Models and Structure
```typescript
// Define interfaces and types needed for the feature
interface MCPToolParams {
  // Parameters for the MCP tool
}

interface MCPToolResult {
  // Expected result structure
}
```

### List of Tasks
```yaml
Task 1: Define MCP Tool Schema
CREATE/MODIFY: [file path]
  - PATTERN: Follow existing MCP tool patterns
  - DEFINE: Tool parameters and result schemas
  - VALIDATE: Input parameter validation

Task 2: Implement Core Logic
CREATE/MODIFY: [file path]
  - PATTERN: Use existing service classes
  - IMPLEMENT: Core functionality
  - HANDLE: Error cases and edge conditions

Task 3: Add MCP Tool Registration
MODIFY: [MCP server file]
  - PATTERN: Follow existing tool registration
  - REGISTER: New tool with proper schema
  - TEST: Tool execution flow

Task 4: Add Comprehensive Tests
CREATE: tests/[test file]
  - PATTERN: Use existing test patterns
  - TEST: Success and failure scenarios
  - MOCK: External API calls

Task 5: Update Documentation
MODIFY: README.md
  - DOCUMENT: New tool functionality
  - INCLUDE: Usage examples
  - UPDATE: API documentation
```

### Integration Points
```yaml
MCP_SERVER:
  - register: "Tool registration in main server"
  - schema: "Parameter and result schemas"
  
AUTHENTICATION:
  - pattern: "Use existing GitHub OAuth flow"
  - validation: "Validate user permissions"
  
APIS:
  - youtube: "Use YouTubeService class"
  - notion: "Use NotionService class"
  - integration: "Use YouTubeNotionIntegration service"
  
MONITORING:
  - logging: "Use existing logger patterns"
  - errors: "Sentry integration for error tracking"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run type-check              # TypeScript validation
npm run lint                    # ESLint validation
npm run format                  # Prettier formatting

# Expected: No errors. If errors, READ and fix.
```

### Level 2: Unit Tests
```bash
# Run comprehensive test suite
npm run test                    # Run all tests
npm run test:watch             # Watch mode for development

# Expected: All tests pass with 80%+ coverage
```

### Level 3: Integration Test
```bash
# Test MCP server functionality
npm run dev                     # Start development server

# Test with MCP Inspector:
npx @modelcontextprotocol/inspector@latest
# Connect to: http://localhost:3000/mcp

# Expected: Tool appears in inspector and executes correctly
```

### Level 4: Build & Deploy Test
```bash
# Verify production build
npm run build                   # Build for production

# Test deployment (if applicable)
wrangler deploy                 # Deploy to Cloudflare Workers
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] MCP tool registers correctly
- [ ] Tool executes with valid inputs
- [ ] Error handling works for invalid inputs
- [ ] Documentation updated
- [ ] Monitoring/logging implemented

---

## Anti-Patterns to Avoid
- ❌ Don't create new service classes when existing ones work
- ❌ Don't skip input validation
- ❌ Don't hardcode API keys or configuration
- ❌ Don't ignore existing authentication patterns
- ❌ Don't skip error handling
- ❌ Don't forget to register tools with MCP server
- ❌ Don't skip comprehensive testing
- ❌ Don't ignore Cloudflare Workers limitations

## Confidence Score: [1-10]

[Rate confidence level for one-pass implementation success]

Reasoning:
- [Factors that increase confidence]
- [Potential challenges or uncertainties]
