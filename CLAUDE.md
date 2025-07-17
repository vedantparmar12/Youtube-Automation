### 🔄 Project Awareness & Context
- **Always read `README.md`** at the start of a new conversation to understand the project's architecture, goals, and constraints.
- **Check existing MCP tools** in `src/tools/` before creating new ones to maintain consistency.
- **Use consistent naming conventions** and follow TypeScript best practices throughout.
- **Follow the existing service pattern** in `src/services/` for API integrations.

### 🏗️ MCP Server Architecture & Structure
- **Never create files longer than 300 lines of code.** If a file approaches this limit, refactor by splitting it into modules.
- **Organize MCP tools** into logical groups in the `src/tools/` directory.
- **Use existing service classes** (`YouTubeService`, `NotionService`) for API interactions.
- **Follow the existing authentication pattern** using GitHub OAuth.
- **Use TypeScript interfaces** defined in `src/types/index.ts` for type safety.

### 🔒 Security & Authentication
- **Never hardcode API keys** - always use environment variables from `config/index.ts`.
- **Implement proper input validation** using the existing validation utilities in `src/utils/validation.ts`.
- **Use the existing security patterns** from `src/utils/security.ts` for API interactions.
- **Always sanitize user inputs** before passing to external APIs.
- **Follow OAuth flow patterns** established in `src/auth/github-handler.ts`.

### 🧪 Testing & Reliability
- **Always create comprehensive tests** for new MCP tools using Vitest.
- **Test both success and failure scenarios** for all API integrations.
- **Mock external API calls** in tests using vi.mock().
- **Ensure 80%+ test coverage** for new features.
- **Test MCP tool registration** and execution flows.

### 📊 Monitoring & Observability
- **Use structured logging** with the existing logger from `src/utils/logger.ts`.
- **Include request/response logging** for debugging MCP tool executions.
- **Use Sentry integration** for error tracking in production (see `src/index-sentry.ts`).
- **Log performance metrics** for YouTube and Notion API calls.

### 🚀 Cloudflare Workers & Deployment
- **Follow the existing Cloudflare Workers patterns** in `src/index.ts`.
- **Use environment variables** properly configured in `wrangler.jsonc`.
- **Implement proper error handling** for Worker runtime limitations.
- **Use KV storage** for OAuth state management following existing patterns.

### ✅ Task Completion & Quality
- **Run all validation commands** before marking tasks complete:
  - `npm run type-check` - TypeScript validation
  - `npm run lint` - Code linting
  - `npm run test` - Test suite
  - `npm run build` - Build verification
- **Update documentation** when adding new MCP tools or changing APIs.
- **Follow semantic versioning** for package updates.

### 📚 Code Style & Conventions
- **Use TypeScript** with strict mode enabled.
- **Follow existing import patterns** using ES modules.
- **Use async/await** consistently for asynchronous operations.
- **Implement proper error handling** with try/catch blocks.
- **Use descriptive variable names** and add JSDoc comments for complex functions.
- **Follow the existing file structure** and naming conventions.

### 🔧 MCP Tool Development
- **Register tools** using the existing pattern in MCP server setup.
- **Use proper MCP SDK patterns** for tool definitions and execution.
- **Include comprehensive tool descriptions** and parameter schemas.
- **Handle tool execution errors** gracefully with user-friendly messages.
- **Test tool integration** with MCP Inspector during development.

### 🌐 API Integration Best Practices
- **Use existing service classes** for YouTube and Notion API calls.
- **Implement proper rate limiting** to respect API quotas.
- **Handle API errors gracefully** with proper error messages.
- **Cache API responses** when appropriate to improve performance.
- **Follow API-specific patterns** for pagination and filtering.

### 🧠 AI Behavior Rules
- **Never assume missing context** - ask questions if requirements are unclear.
- **Always verify file paths** and imports before referencing them.
- **Follow existing patterns** rather than introducing new approaches.
- **Test integrations thoroughly** before marking features complete.
- **Document any breaking changes** or new dependencies clearly.
