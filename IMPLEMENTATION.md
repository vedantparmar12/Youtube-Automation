# PRP Parser MCP Server - Implementation Guide

This guide provides step-by-step instructions to set up, test, and deploy the PRP Parser MCP Server that extracts PRPs from YouTube videos and syncs them to Notion.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [API Keys Configuration](#api-keys-configuration)
5. [Local Development](#local-development)
6. [Testing the Implementation](#testing-the-implementation)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:

- Node.js (v18 or higher) and npm installed
- PostgreSQL database (local or cloud-hosted)
- Cloudflare account (free tier works)
- GitHub account with OAuth app
- Google Cloud account (for YouTube API)
- Notion account with workspace access
- Google AI account with Gemini API access

## Environment Setup

### Step 1: Clone and Navigate to Project

```bash
# If you haven't already cloned the repository
git clone 
# Or navigate to existing project
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# Install Wrangler CLI globally if not already installed
npm install -g wrangler

# Verify Wrangler installation
wrangler --version
```

### Step 3: Create Environment Variables File

```bash
# Copy the example environment file
cp .dev.vars.example .dev.vars

# Open .dev.vars in your editor and fill in all values
```

## Database Setup

### Step 1: Create PostgreSQL Database

```bash
# If using local PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE prp_parser_db;

# Exit psql
\q
```

### Step 2: Run Database Migrations

```bash
# Connect to your database
psql -U postgres -d prp_parser_db

# Run the migration script
\i migrations/001_create_prp_tables.sql

# Verify tables were created
\dt

# You should see:
# - parsed_prps
# - prp_tasks
# - prp_summaries (view)
```

### Step 3: Update Database URL in .dev.vars

```bash
# Edit .dev.vars and update DATABASE_URL
DATABASE_URL=postgresql://username:password@localhost:5432/prp_parser_db
```

## API Keys Configuration

### Step 1: GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: `PRP Parser MCP`
   - Homepage URL: `http://localhost:8793`
   - Authorization callback URL: `http://localhost:8793/callback`
4. Click "Register application"
5. Copy Client ID and generate a Client Secret
6. Add to `.dev.vars`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### Step 2: YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable YouTube Data API v3:
   - Go to APIs & Services → Library
   - Search for "YouTube Data API v3"
   - Click Enable
4. Create credentials:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → API Key
   - Restrict key to YouTube Data API v3
5. Add to `.dev.vars`:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

### Step 3: Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in:
   - Name: `PRP Parser`
   - Associated workspace: Select your workspace
   - Capabilities: Read, Update, Insert content
4. Click Submit
5. Copy the Integration Token
6. Add to `.dev.vars`:
   ```
   NOTION_TOKEN=your_notion_integration_token
   ```

### Step 4: Create Notion Database

1. Create a new Notion page
2. Add a database with these properties:
   - Name (Title)
   - YouTube URL (URL)
   - Video Title (Text)
   - Channel (Text)
   - Created By (Text)
   - PRP ID (Text)
   - Task Count (Number)
   - Status (Select with options: Parsed, Updated)
3. Share the database with your integration:
   - Click "..." menu → Add connections
   - Select your PRP Parser integration
4. Copy the database ID from the URL:
   ```
   https://notion.so/workspace/1234567890abcdef?v=...
   Database ID: 1234567890abcdef
   ```

### Step 5: Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add to `.dev.vars`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-1.5-flash
   ```

### Step 6: Cookie Encryption Key

Generate a secure key:

```bash
# Generate a random key
openssl rand -base64 32

# Add to .dev.vars
COOKIE_ENCRYPTION_KEY=generated_key_here
```

## Local Development

### Step 1: Login to Cloudflare

```bash
wrangler login
```

### Step 2: Generate TypeScript Types

```bash
# Generate types for the PRP configuration
npx wrangler types --config wrangler-prp.jsonc
```

### Step 3: Start Development Server

```bash
# Start the PRP Parser MCP server
npm run dev:prp

# Server will be available at http://localhost:8793
```

### Step 4: Test OAuth Flow

1. Open browser to `http://localhost:8793/authorize`
2. You should see GitHub OAuth prompt
3. Authorize the application
4. You should be redirected back successfully

## Testing the Implementation

### Step 1: Test with MCP Inspector

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# In a new terminal, run the inspector
npx @modelcontextprotocol/inspector

# Connect to your local server
# URL: http://localhost:8793/mcp
```

### Step 2: Test parseYoutubePRP Tool

In MCP Inspector, test the main tool:

```json
{
  "method": "tools/call",
  "params": {
    "name": "parseYoutubePRP",
    "arguments": {
      "youtube_url": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
      "notion_database_id": "your_notion_database_id",
      "auto_sync": true
    }
  }
}
```

Expected response:
- PRP should be parsed and stored in database
- If auto_sync is true, Notion page should be created
- Response includes prp_id and task count

### Step 3: Test Other Tools

Test listing PRPs:
```json
{
  "method": "tools/call",
  "params": {
    "name": "listParsedPRPs",
    "arguments": {
      "limit": 10
    }
  }
}
```

Test getting PRP details:
```json
{
  "method": "tools/call",
  "params": {
    "name": "getPRPDetails",
    "arguments": {
      "prp_id": "uuid-from-previous-step",
      "include_tasks": true
    }
  }
}
```

### Step 4: Verify Database

```bash
# Check parsed PRPs
psql -U postgres -d prp_parser_db -c "SELECT id, video_title, created_at FROM parsed_prps;"

# Check tasks
psql -U postgres -d prp_parser_db -c "SELECT prp_id, title, status FROM prp_tasks;"

# Check summary view
psql -U postgres -d prp_parser_db -c "SELECT * FROM prp_summaries;"
```

### Step 5: Verify Notion Integration

1. Go to your Notion database
2. Check if new pages were created
3. Verify page content matches parsed PRP

## Production Deployment

### Step 1: Set Production Secrets

```bash
# Set all required secrets for production
wrangler secret put DATABASE_URL --config wrangler-prp.jsonc
wrangler secret put GITHUB_CLIENT_ID --config wrangler-prp.jsonc
wrangler secret put GITHUB_CLIENT_SECRET --config wrangler-prp.jsonc
wrangler secret put COOKIE_ENCRYPTION_KEY --config wrangler-prp.jsonc
wrangler secret put YOUTUBE_API_KEY --config wrangler-prp.jsonc
wrangler secret put NOTION_TOKEN --config wrangler-prp.jsonc
wrangler secret put GEMINI_API_KEY --config wrangler-prp.jsonc
wrangler secret put GEMINI_MODEL --config wrangler-prp.jsonc

# Optional: Sentry for monitoring
wrangler secret put SENTRY_DSN --config wrangler-prp.jsonc
```

### Step 2: Update GitHub OAuth URLs

1. Go to your GitHub OAuth App settings
2. Update URLs for production:
   - Homepage URL: `https://prp-parser-mcp.YOUR-SUBDOMAIN.workers.dev`
   - Callback URL: `https://prp-parser-mcp.YOUR-SUBDOMAIN.workers.dev/callback`

### Step 3: Deploy to Cloudflare Workers

```bash
# Deploy the PRP Parser
npm run deploy:prp

# Note the deployed URL
# Example: https://prp-parser-mcp.YOUR-SUBDOMAIN.workers.dev
```

### Step 4: Test Production Deployment

1. Visit `https://prp-parser-mcp.YOUR-SUBDOMAIN.workers.dev/authorize`
2. Complete OAuth flow
3. Test with production MCP endpoint

### Step 5: Configure Claude Desktop

Update Claude Desktop config:

```json
{
  "mcpServers": {
    "prp-parser": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://prp-parser-mcp.YOUR-SUBDOMAIN.workers.dev/mcp"
      ],
      "env": {}
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Test database connection
psql DATABASE_URL

# Check if tables exist
\dt

# Re-run migrations if needed
```

#### 2. OAuth Errors

- Verify GitHub OAuth app URLs match your environment
- Check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are correct
- Ensure COOKIE_ENCRYPTION_KEY is set

#### 3. YouTube API Errors

- Check API quota in Google Cloud Console
- Verify API key is restricted to YouTube Data API v3
- Test with a public YouTube video

#### 4. Notion Sync Failures

- Verify integration has access to the database
- Check database ID is correct (no hyphens)
- Ensure all required properties exist in Notion database

#### 5. Gemini API Errors

- Check API key is valid
- Verify you have sufficient credits
- Try with a different model if needed

### Debug Commands

```bash
# Check Wrangler logs
wrangler tail --config wrangler-prp.jsonc

# Test specific environment variables
echo $DATABASE_URL | head -c 20

# Verify TypeScript compilation
npm run type-check

# Check for syntax errors
npx tsc --noEmit
```

### Getting Help

If you encounter issues:

1. Check the logs in Cloudflare dashboard
2. Review error messages in MCP Inspector
3. Verify all environment variables are set
4. Check database connectivity
5. Ensure all API services are accessible

## Verification Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured in .dev.vars
- [ ] Database created and migrations run
- [ ] GitHub OAuth app configured
- [ ] YouTube API enabled and key created
- [ ] Notion integration created and shared with database
- [ ] Gemini API key obtained
- [ ] Local server starts without errors
- [ ] OAuth flow completes successfully
- [ ] parseYoutubePRP tool works
- [ ] Data appears in PostgreSQL database
- [ ] Notion pages are created when syncing
- [ ] Production deployment successful
- [ ] Production OAuth URLs updated

## Next Steps

Once everything is working:

1. Add more YouTube videos to build your PRP library
2. Customize the Notion database properties
3. Create automated workflows with the extracted tasks
4. Monitor usage and errors with Sentry
5. Add custom PRP parsing rules for specific video formats

---

**Support**: If you need help, check the main README.md or create an issue in the repository.
