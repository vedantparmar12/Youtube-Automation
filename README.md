# YouTube-Notion MCP Server

A production-level Model Context Protocol (MCP) server for integrating YouTube videos with Notion databases. This server provides secure, authenticated access to YouTube API and Notion API with comprehensive error handling, rate limiting, and monitoring.

## Features

- **YouTube Integration**: Search videos, get video details, and extract metadata
- **Notion Integration**: Create pages, save video information, and manage database entries
- **Security**: Input validation, rate limiting, and secure error handling
- **Authentication**: OAuth integration with GitHub
- **Monitoring**: Sentry integration for error tracking and performance monitoring
- **Cloudflare Workers**: Scalable serverless deployment
- **Production Ready**: Comprehensive logging, configuration validation, and error handling

## Tools Available

### YouTube Tools
- `search_youtube_videos`: Search for YouTube videos by query
- `get_youtube_video_details`: Get detailed information about a specific video

### Notion Tools
- `create_notion_page`: Create new pages in Notion database
- `save_youtube_video_to_notion`: Save YouTube video information to Notion
- `list_notion_pages`: List pages from Notion database with filtering

## Setup

### Prerequisites
- Node.js 18+ 
- YouTube Data API v3 key
- Notion integration token and database ID
- GitHub OAuth app (for authentication)
- Sentry DSN (for error tracking)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vedantparmar12/Youtube-Automation.git
cd youtube-notion
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. For Cloudflare Workers development:
```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your development variables
```

### Configuration

#### Environment Variables

**Required:**
- `YOUTUBE_API_KEY`: Your YouTube Data API v3 key
- `NOTION_API_KEY`: Your Notion integration token
- `NOTION_DATABASE_ID`: ID of your Notion database

**Optional:**
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret
- `SENTRY_DSN`: Sentry DSN for error tracking
- `ENVIRONMENT`: Environment (development/production)

#### Notion Database Setup

Your Notion database should have the following properties:
- `Title` (title)
- `Video ID` (rich text)
- `Channel` (rich text)
- `Published` (date)
- `Duration` (rich text)
- `Views` (number)
- `Likes` (number)
- `URL` (url)
- `Tags` (multi-select)

## Development

### Local Development
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Testing
```bash
npm run test
npm run test:watch
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## Deployment

### Cloudflare Workers

1. Configure `wrangler.jsonc` with your project details
2. Set up KV namespace for OAuth:
```bash
wrangler kv:namespace create "OAUTH_KV"
```

3. Deploy:
```bash
npm run deploy
```

### Environment Variables in Production

Set the following secrets in Cloudflare Workers:
```bash
wrangler secret put YOUTUBE_API_KEY
wrangler secret put NOTION_API_KEY
wrangler secret put NOTION_DATABASE_ID
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put SENTRY_DSN
```

## API Usage

### Search YouTube Videos
```json
{
  "tool": "search_youtube_videos",
  "arguments": {
    "query": "tutorial programming",
    "maxResults": 10,
    "order": "relevance"
  }
}
```

### Save Video to Notion
```json
{
  "tool": "save_youtube_video_to_notion",
  "arguments": {
    "videoId": "dQw4w9WgXcQ",
    "customTitle": "My Custom Title",
    "notes": "Additional notes about the video",
    "tags": ["tutorial", "programming"]
  }
}
```

## Security Features

- **Input Validation**: All inputs are validated against security patterns
- **Rate Limiting**: Configurable rate limiting to prevent abuse
- **Error Sanitization**: Sensitive information is filtered from error messages
- **OAuth Authentication**: Secure GitHub OAuth integration
- **HTTPS Only**: Production deployment enforces HTTPS
- **API Key Validation**: Basic validation of API key formats

## Monitoring and Observability

### Sentry Integration
- Error tracking and performance monitoring
- Automatic error reporting with context
- Custom error filtering to prevent sensitive data leakage

### Logging
- Structured JSON logging in production
- Configurable log levels
- Request/response logging with sensitive data filtering

### Health Checks
- Built-in health check endpoints
- Database connection monitoring
- API dependency status checks

## Error Handling

The server implements comprehensive error handling:
- **Validation Errors**: Clear messages for invalid inputs
- **API Errors**: Graceful handling of external API failures
- **Rate Limiting**: Proper HTTP status codes and retry headers
- **Authentication Errors**: Secure error messages without sensitive info

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the logs for debugging information
