# Generate YouTube-Notion MCP Server PRP

## Feature file: $ARGUMENTS

Generate a comprehensive PRP for YouTube-Notion MCP server feature implementation with thorough research. Ensure context is passed to the AI agent to enable self-validation and iterative refinement for production-ready MCP servers.

Read the feature file first to understand what needs to be created, how the examples provided help, and any other considerations.

The AI agent only gets the context you are appending to the PRP and training data. Assume the AI agent has access to the codebase and the same knowledge cutoff as you, so it's important that your research findings are included or referenced in the PRP. The Agent has web search capabilities, so pass URLs to documentation and examples.

## Research Process

1. **MCP Server Codebase Analysis**
   - Search for similar MCP patterns in the existing codebase
   - Identify YouTube and Notion integration patterns to reference
   - Note existing TypeScript, Cloudflare Workers, and Sentry conventions
   - Check test patterns for validation approach
   - Review authentication and security patterns

2. **External Research**
   - MCP SDK documentation and patterns
   - YouTube Data API v3 documentation
   - Notion API documentation
   - Cloudflare Workers deployment patterns
   - TypeScript best practices for MCP servers
   - Security patterns for API integrations

3. **User Clarification** (if needed)
   - Specific MCP tool patterns to follow?
   - YouTube/Notion integration requirements?
   - Authentication and security requirements?

## PRP Generation

Using PRPs/templates/prp_mcp_base.md as template:

### Critical Context to Include and pass to the AI agent as part of the PRP
- **MCP Documentation**: Official MCP SDK docs with specific patterns
- **API Documentation**: YouTube Data API v3 and Notion API specific endpoints
- **Code Examples**: Real patterns from existing MCP server codebase
- **Security Patterns**: Authentication, validation, and error handling
- **Deployment Patterns**: Cloudflare Workers configuration and deployment

### Implementation Blueprint
- Start with MCP tool registration patterns
- Reference existing authentication and validation patterns
- Include comprehensive error handling for API failures
- List tasks in execution order with TypeScript focus
- Include Sentry monitoring and logging patterns

### Validation Gates (Must be Executable for TypeScript MCP)
```bash
# TypeScript type checking
npm run type-check

# Linting and formatting
npm run lint
npm run format

# Testing
npm run test

# Build verification
npm run build

# Local development test
npm run dev
```

*** CRITICAL AFTER YOU ARE DONE RESEARCHING AND EXPLORING THE CODEBASE BEFORE YOU START WRITING THE PRP ***

*** ULTRATHINK ABOUT THE MCP SERVER PRP AND PLAN YOUR APPROACH THEN START WRITING THE PRP ***

## Output
Save as: `PRPs/{feature-name}.md`

## Quality Checklist for MCP Server PRPs
- [ ] All MCP SDK context included
- [ ] YouTube/Notion API patterns documented
- [ ] Validation gates are executable by AI
- [ ] References existing codebase patterns
- [ ] Clear implementation path with TypeScript focus
- [ ] Error handling and security documented
- [ ] Cloudflare Workers deployment context included
- [ ] Sentry monitoring patterns included

Score the PRP on a scale of 1-10 (confidence level to succeed in one-pass MCP server implementation)

Remember: The goal is one-pass MCP server implementation success through comprehensive context engineering.
