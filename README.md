# YouTube Automation

## Overview

This documentation provides a comprehensive guide to the YouTube Automation system built on the Model Context Protocol (MCP) server architecture. The system enables automatic extraction and processing of product requirements from YouTube videos, managing the entire workflow from video ingestion to structured data storage and task management.

## System Architecture

The YouTube Automation system is built as a Cloudflare Workers application using the Model Context Protocol (MCP) framework. It leverages several key technologies:

- **Cloudflare Workers**: Serverless execution environment
- **MCP (Model Context Protocol)**: Protocol for AI context management
- **Hono**: Lightweight web framework for Cloudflare Workers
- **PostgreSQL**: Database for storing processed data
- **OAuth Provider**: Authentication for API access
- **Sentry**: Error monitoring and tracking

## Core Components

### 1. YouTube Client

The YouTube client component handles video retrieval and metadata extraction from the YouTube API. It provides functionality to:

- Fetch video details by ID or URL
- Extract video metadata (title, description, timestamps)
- Process video captions/transcripts
- Handle API authentication and rate limiting

### 2. PRP Parser

The Product Requirements Prompt (PRP) parser is responsible for extracting structured information from YouTube videos. Key features include:

- AI-powered video content analysis
- Extraction of product requirements, specifications, and tasks
- Timestamp correlation for navigating to specific content sections
- Structured data output generation

### 3. Database Integration

The system uses a PostgreSQL database to store:

- Parsed PRPs (Product Requirement Prompts)
- Extracted tasks and implementation details
- Sync status with external systems like Notion
- User associations and permissions

Key tables include:
- `prp_tables`: Stores main PRP data
- `task_types`: Defines different types of implementation tasks
- Additional metadata and relationship tables

### 4. Notion Integration

The system can synchronize parsed PRP data to Notion databases, allowing for:

- Automatic creation of PRP pages in specified Notion databases
- Updating existing Notion pages with new PRP content
- Tracking sync status between the system and Notion
- Task management within Notion

## Workflow

### 1. Video Ingestion

1. User submits a YouTube URL to the system
2. System validates the URL and fetches basic video metadata
3. Video transcript/captions are extracted for processing

### 2. PRP Extraction

1. AI models analyze the video content to identify key product requirements
2. Structured PRP data is generated including:
   - Main product requirements
   - Feature specifications
   - Implementation considerations
   - Timestamps for navigation

### 3. Task Generation

1. The system extracts actionable implementation tasks from the PRP
2. Tasks are categorized and prioritized
3. Dependencies between tasks are identified
4. Estimates for implementation effort may be generated

### 4. Data Storage and Synchronization

1. Extracted PRP and tasks are stored in the database
2. Data can be synchronized to external systems like Notion
3. Updates to tasks (status changes, etc.) are tracked

## API Endpoints

### PRP Parser Endpoints

- `parseYoutubePRP`: Parse a PRP from a YouTube video URL
  - Parameters: YouTube URL, optional Notion database ID for sync
  - Returns: Parsed PRP data with unique ID

- `syncToNotion`: Sync a parsed PRP to a Notion database
  - Parameters: PRP ID, Notion database ID, update options
  - Creates or updates a Notion page with PRP content

- `checkNotionSyncStatus`: Check the status of Notion syncs
  - Parameters: Optional PRP IDs to check, sync status filter
  - Returns: Sync status information for specified PRPs

- `listParsedPRPs`: List all previously parsed PRPs
  - Parameters: Filtering and pagination options
  - Returns: List of parsed PRPs matching criteria

- `getPRPDetails`: Get detailed information about a specific PRP
  - Parameters: PRP ID, option to include tasks
  - Returns: Complete PRP data including tasks if requested

- `extractTasks`: Extract implementation tasks from a parsed PRP
  - Parameters: PRP ID, maximum number of tasks to extract
  - Uses AI to generate actionable tasks from the PRP

- `updateTaskStatus`: Update the status of a PRP task
  - Parameters: Task ID, new status
  - Changes task status (pending, in_progress, completed, blocked)

## Authentication and Security

The system leverages Cloudflare Workers OAuth Provider for authentication:

- OAuth 2.0 flow for secure API access
- JWT token validation for authenticated requests
- Role-based access control for different operations
- Secure credential management

## Error Handling and Monitoring

The system integrates with Sentry for comprehensive error tracking:

- Real-time error notifications
- Error aggregation and analysis
- Performance monitoring
- Custom context for debugging

## Database Schema

### PRP Tables (from migrations/001_create_prp_tables.sql)

The database schema includes tables for:

- Storing parsed PRPs
- Managing tasks extracted from PRPs
- Tracking Notion sync status
- User associations and permissions

### Task Types (from migrations/002_update_task_types.sql)

The system categorizes tasks into different types to help with organization and prioritization.

## Client Integration

Developers can integrate with the YouTube Automation system through:

1. **REST API**: Direct HTTP requests to the API endpoints
2. **SDK**: Using the MCP SDK for programmatic access
3. **UI Integration**: Embedding components in existing applications

## Deployment

The system is deployed as a Cloudflare Worker, providing:

- Global distribution and low latency
- Automatic scaling
- High availability
- Cost-effective execution

## Development Setup

To set up a local development environment:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables for API keys and database connections
4. Run development server:
   ```
   npm run dev
   ```
5. Run tests:
   ```
   npm test
   ```

## Configuration

The system can be configured through:

- Environment variables
- Configuration files
- Database settings

Key configuration options include:

- API credentials for YouTube, Notion, etc.
- Database connection details
- AI model parameters
- Cloudflare Worker settings

## Troubleshooting

Common issues and their solutions:

1. **YouTube API Access**: Ensure API key has correct permissions
2. **Database Connectivity**: Check connection strings and firewall settings
3. **Notion Integration**: Verify OAuth tokens and permissions
4. **Worker Timeouts**: Consider breaking operations into smaller chunks

## Future Enhancements

Planned future enhancements include:

1. Additional AI models for improved extraction accuracy
2. Support for more video platforms beyond YouTube
3. Enhanced task dependency management
4. Advanced analytics on extracted PRPs
5. Integration with additional project management tools

## Conclusion

The YouTube Automation system provides a powerful way to extract structured product requirements from YouTube videos, enabling more efficient product development workflows. By automating the extraction and organization of this information, teams can focus on implementation rather than manual documentation.
