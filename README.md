# MCP Server Builder - Context Engineering Use Case

This use case demonstrates how to use **Context Engineering** and the **PRP (Product Requirements Prompt) process** to build production-ready Model Context Protocol (MCP) servers. It provides a proven template and workflow for creating MCP servers with GitHub OAuth authentication, database integration, and Cloudflare Workers deployment.

> A PRP is PRD + curated codebase intelligence + agent/runbook—the minimum viable packet an AI needs to plausibly ship production-ready code on the first pass.

## 🚀 Quick Start

### Prerequisites

- Node.js and npm installed
- Cloudflare account (free tier works)
- GitHub account for OAuth
- PostgreSQL database (local or hosted)

### Step 1: Setup Your Project

```bash
# Clone the context engineering repository
git clone https://github.com/coleam00/Context-Engineering-Intro.git
cd Context-Engineering-Intro/use-cases/mcp-server

# Copy template to your new project directory
python copy_template.py my-mcp-server-project

# Navigate to your new project
cd my-mcp-server-project

# Install dependencies
npm install

# Install Wrangler CLI globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login
```

**What copy_template.py does:**
- Copies all template files except build artifacts (respects .gitignore)
- Renames README.md to README_TEMPLATE.md (so you can create your own README)
- Includes all source code, examples, tests, and configuration files
- Preserves the complete context engineering setup

## 🎯 What You'll Learn

This use case teaches you how to:

- **Use the PRP process** to systematically build complex MCP servers
- **Leverage specialized context engineering** for MCP development
- **Follow proven patterns** from a production-ready MCP server template
- **Implement secure authentication** with GitHub OAuth and role-based access
- **Deploy to Cloudflare Workers** with monitoring and error handling

## 📋 How It Works - The PRP Process for MCP Servers

> **Step 1 is the Quick Start setup above** - clone repo, copy template, install dependencies, setup Wrangler

### Step 2: Define Your MCP Server

Edit `PRPs/INITIAL.md` to describe your specific MCP server requirements:

```markdown
## FEATURE:
We want to create a weather MCP server that provides real-time weather data
with caching and rate limiting.

## ADDITIONAL FEATURES:
- Integration with OpenWeatherMap API
- Redis caching for performance
- Rate limiting per user
- Historical weather data access
- Location search and autocomplete

## OTHER CONSIDERATIONS:
- API key management for external services
- Proper error handling for API failures
- Coordinate validation for location queries
```

### Step 3: Generate Your PRP

Use the specialized MCP PRP command to create a comprehensive implementation plan:

```bash
/prp-mcp-create INITIAL.md
```

**What this does:**
- Reads your feature request
- Researches the existing MCP codebase patterns
- Studies authentication and database integration patterns
- Creates a comprehensive PRP in `PRPs/your-server-name.md`
- Includes all context, validation loops, and step-by-step tasks

> It's important after your PRP is generated to validate everything! With the PRP framework, you are meant to be a part of the process to ensure the quality of all context! An execution is only as good as your PRP. Use /prp-mcp-create as a solid starting point.

### Step 4: Execute Your PRP

Use the specialized MCP execution command to build your server:

```bash
/prp-mcp-execute PRPs/your-server-name.md
```

**What this does:**
- Loads the complete PRP with all context
- Creates a detailed implementation plan using TodoWrite
- Implements each component following proven patterns
- Runs comprehensive validation (TypeScript, tests, deployment)
- Ensures your MCP server works end-to-end

### Step 5: Configure Environment

```bash
# Create environment file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your credentials
# - GitHub OAuth app credentials
# - Database connection string
# - Cookie encryption key
```

### Step 6: Test and Deploy

```bash
# Test locally
wrangler dev --config <your wrangler config (.jsonc)>

# Test with MCP Inspector
npx @modelcontextprotocol/inspector@latest
# Connect to: http://localhost:8792/mcp

# Deploy to production
wrangler deploy
```

## 🏗️ MCP-Specific Context Engineering

This use case includes specialized context engineering components designed specifically for MCP server development:

### Specialized Slash Commands

Located in `.claude/commands/`:

- **`/prp-mcp-create`** - Generates PRPs specifically for MCP servers
- **`/prp-mcp-execute`** - Executes MCP PRPs with comprehensive validation

These are specialized versions of the generic commands in the root `.claude/commands/`, but tailored for MCP development patterns.

### Specialized PRP Template

The template `PRPs/templates/prp_mcp_base.md` includes:

- **MCP-specific patterns** for tool registration and authentication
- **Cloudflare Workers configuration** for deployment
- **GitHub OAuth integration** patterns
- **Database security** and SQL injection protection
- **Comprehensive validation loops** from TypeScript to production

### AI Documentation

The `PRPs/ai_docs/` folder contains:

- **`mcp_patterns.md`** - Core MCP development patterns and security practices
- **`claude_api_usage.md`** - How to integrate with Anthropic's API for LLM-powered features

## 🔧 Template Architecture

This template provides a complete, production-ready MCP server with:

### Core Components

```
src/
├── index.ts                 # Main authenticated MCP server
├── index_sentry.ts         # Version with Sentry monitoring
├── simple-math.ts          # Basic MCP example (no auth)
├── github-handler.ts       # Complete GitHub OAuth implementation
├── database.ts             # PostgreSQL with security patterns
├── utils.ts                # OAuth helpers and utilities
├── workers-oauth-utils.ts  # HMAC-signed cookie system
└── tools/                  # Modular tool registration system
    └── register-tools.ts   # Central tool registry
```

### Example Tools

The `examples/` folder shows how to create MCP tools:

- **`database-tools.ts`** - Example database tools with proper patterns
- **`database-tools-sentry.ts`** - Same tools with Sentry monitoring

### Key Features

- **🔐 GitHub OAuth** - Complete authentication flow with role-based access
- **🗄️ Database Integration** - PostgreSQL with connection pooling and security
- **🛠️ Modular Tools** - Clean separation of concerns with central registration
- **☁️ Cloudflare Workers** - Global edge deployment with Durable Objects
- **📊 Monitoring** - Optional Sentry integration for production
- **🧪 Testing** - Comprehensive validation from TypeScript to deployment

## 🔍 Key Files to Understand

To fully understand this use case, examine these files:

### Context Engineering Components

- **`PRPs/templates/prp_mcp_base.md`** - Specialized MCP PRP template
- **`.claude/commands/prp-mcp-create.md`** - MCP-specific PRP generation
- **`.claude/commands/prp-mcp-execute.md`** - MCP-specific execution

### Implementation Patterns

- **`src/index.ts`** - Complete MCP server with authentication
- **`examples/database-tools.ts`** - Tool creation and registration patterns
- **`src/tools/register-tools.ts`** - Modular tool registration system

### Configuration & Deployment

- **`wrangler.jsonc`** - Cloudflare Workers configuration
- **`.dev.vars.example`** - Environment variable template
- **`CLAUDE.md`** - Implementation guidelines and patterns

## 📈 Success Metrics

When you successfully use this process, you'll achieve:

- **Fast Implementation** - Quickly have an MCP Server with minimal iterations
- **Production Ready** - Secure authentication, monitoring, and error handling
- **Scalable Architecture** - Clean separation of concerns and modular design
- **Comprehensive Testing** - Validation from TypeScript to production deployment

## 🤝 Contributing

This use case demonstrates the power of Context Engineering for complex software development. To improve it:

1. **Add new MCP server examples** to show different patterns
2. **Enhance the PRP templates** with more comprehensive context
3. **Improve validation loops** for better error detection
4. **Document edge cases** and common pitfalls

The goal is to make MCP server development predictable and successful through comprehensive context engineering.

---

**Ready to build your MCP server?** Follow the complete process above: setup your project with the copy template, configure your environment, define your requirements in `PRPs/INITIAL.md`, then generate and execute your PRP to build your production-ready MCP server.

---

## 📹 PRP Parser MCP Server

The PRP Parser MCP Server is a specialized implementation that extracts Product Requirements Prompts (PRPs) from YouTube videos, parses them using AI, and syncs them to Notion databases.

### Features

- **YouTube Integration**: Extract video metadata and transcripts
- **AI-Powered Parsing**: Use Anthropic Claude to parse PRPs from video content
- **Notion Sync**: Automatically create and update Notion pages with parsed PRPs
- **Task Management**: Extract and track implementation tasks from PRPs
- **Database Storage**: PostgreSQL storage for all parsed PRPs and tasks

### Setup Instructions

#### 1. Environment Configuration

Update your `.dev.vars` file with the required API keys:

```bash
# Existing OAuth and database configuration
GITHUB_CLIENT_ID=<your github client id>
GITHUB_CLIENT_SECRET=<your github client secret>
COOKIE_ENCRYPTION_KEY=<your cookie encryption key>
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# YouTube API configuration
YOUTUBE_API_KEY=<your YouTube Data API v3 key>

# Notion configuration
NOTION_TOKEN=<your Notion integration token>

# Anthropic configuration
ANTHROPIC_API_KEY=<your Anthropic API key>
ANTHROPIC_MODEL=claude-3-sonnet-20240229  # Optional, defaults to this model
```

#### 2. Database Setup

Run the migration to create PRP-specific tables:

```sql
-- Run migrations/001_create_prp_tables.sql in your PostgreSQL database
-- This creates tables for parsed_prps, prp_tasks, and supporting views
```

#### 3. API Keys Setup

**YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials → API Key
5. Restrict the key to YouTube Data API v3

**Notion Integration:**
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the integration token
4. Share your Notion database with the integration

**Anthropic API Key:**
1. Sign up at [Anthropic](https://www.anthropic.com/)
2. Get your API key from the dashboard
3. Choose your preferred Claude model

#### 4. Running the PRP Parser

```bash
# Start the PRP Parser MCP server locally
npm run dev:prp

# The server will be available at http://localhost:8793

# Deploy to production
npm run deploy:prp
```

### Available Tools

1. **parseYoutubePRP** - Extract and parse a PRP from a YouTube URL
   - Fetches video metadata and transcript
   - Uses AI to parse structured PRP content
   - Stores in database with task extraction
   - Optional auto-sync to Notion

2. **syncToNotion** - Sync a parsed PRP to Notion (privileged users only)
   - Creates formatted Notion pages
   - Updates existing pages if specified
   - Tracks sync status in database

3. **listParsedPRPs** - List all parsed PRPs with filtering
   - Filter by creator, sync status
   - Pagination support
   - Shows task completion stats

4. **getPRPDetails** - Get detailed information about a specific PRP
   - Full PRP content and metadata
   - Associated tasks with status
   - Notion sync information

5. **extractTasks** - Extract additional tasks from a PRP using AI (privileged users only)
   - Generate more implementation tasks
   - AI-powered task extraction
   - Automatic database storage

6. **updateTaskStatus** - Update task completion status (privileged users only)
   - Track task progress
   - Mark tasks as completed/blocked
   - Audit trail with user tracking

### Claude Desktop Configuration

To use the PRP Parser with Claude Desktop:

```json
{
  "mcpServers": {
    "prp-parser": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:8793/mcp"],
      "env": {}
    }
  }
}
```

### Example Usage

```typescript
// Parse a YouTube video containing a PRP
const result = await parseYoutubePRP({
  youtube_url: "https://youtube.com/watch?v=VIDEO_ID",
  notion_database_id: "your-notion-database-id", // optional
  auto_sync: true // automatically sync to Notion
});

// List all parsed PRPs
const prps = await listParsedPRPs({
  created_by: "username",
  sync_status: "synced",
  limit: 20
});

// Get detailed PRP information
const details = await getPRPDetails({
  prp_id: "uuid-of-prp",
  include_tasks: true
});
```

### Security Notes

- GitHub OAuth required for all operations
- Write operations (sync, extract, update) restricted to allowed users
- API keys stored as environment variables/secrets
- SQL injection protection on all database queries
- Error messages sanitized to prevent information leakage