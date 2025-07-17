name: "YouTube Playlist to Notion Sync Tool"
description: |

## Purpose
Create a comprehensive YouTube playlist synchronization tool that imports entire playlists into Notion with metadata enrichment, progress tracking, and duplicate detection.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **MCP Patterns**: Follow established MCP SDK patterns and tool registration

---

## Goal
Create a production-ready MCP tool that synchronizes YouTube playlists to Notion databases with comprehensive metadata, progress tracking, and error recovery.

## Why
- **Business value**: Automates content curation and organization workflows
- **Integration**: Seamlessly connects video content with structured knowledge management
- **Problems solved**: Eliminates manual copying of playlist information to Notion

## What
An MCP tool that accepts YouTube playlist URLs and creates corresponding Notion database entries for each video with rich metadata including thumbnails, descriptions, duration, and categorization.

### Success Criteria
- [ ] Tool accepts YouTube playlist URLs and validates them
- [ ] Retrieves all videos from playlist with pagination support
- [ ] Creates Notion pages for each video with comprehensive metadata
- [ ] Handles rate limiting and API failures gracefully
- [ ] Provides progress updates during long operations
- [ ] Detects and skips duplicate entries
- [ ] Includes comprehensive error handling and logging

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://github.com/modelcontextprotocol/sdk
  why: MCP SDK patterns for tool registration and execution
  
- url: https://developers.google.com/youtube/v3/docs/playlistItems/list
  why: YouTube API playlist items retrieval with pagination
  
- url: https://developers.google.com/youtube/v3/docs/videos/list
  why: YouTube API video details retrieval
  
- url: https://developers.notion.com/reference/create-a-page
  why: Notion API page creation with rich properties
  
- file: src/services/YouTubeService.ts
  why: Existing YouTube API integration patterns
  
- file: src/services/NotionService.ts
  why: Existing Notion API integration patterns
  
- file: src/services/YouTubeNotionIntegration.ts
  why: Integration service patterns to follow
  
- file: src/utils/validation.ts
  why: Input validation patterns for URLs
  
- file: src/utils/security.ts
  why: Security patterns for API interactions
  
- file: src/utils/logger.ts
  why: Structured logging patterns
```

### Current Codebase Tree
```bash
src/
├── services/
│   ├── YouTubeService.ts      # YouTube API integration
│   ├── NotionService.ts       # Notion API integration
│   └── YouTubeNotionIntegration.ts  # Integration service
├── utils/
│   ├── validation.ts          # Input validation
│   ├── security.ts            # Security utilities
│   └── logger.ts              # Structured logging
├── types/
│   └── index.ts               # Type definitions
└── index.ts                   # Main MCP server
```

### Desired Codebase Tree
```bash
src/
├── services/
│   ├── YouTubeService.ts      # Enhanced with playlist support
│   ├── NotionService.ts       # Enhanced with batch operations
│   └── YouTubeNotionIntegration.ts  # Enhanced with playlist sync
├── tools/
│   └── playlist-sync.ts       # New MCP tool for playlist sync
├── utils/
│   ├── playlist-parser.ts     # New - playlist URL parsing
│   └── progress-tracker.ts    # New - progress tracking utility
└── types/
    └── playlist.ts            # New - playlist-specific types
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: YouTube API has strict quota limits - implement batching
// CRITICAL: Playlist items API requires pagination with nextPageToken
// CRITICAL: Video details API accepts up to 50 video IDs per request
// CRITICAL: Notion API has rate limits - implement exponential backoff
// CRITICAL: Large playlists may exceed Cloudflare Workers timeout
// CRITICAL: Handle private/deleted videos gracefully
// CRITICAL: YouTube playlist URLs have multiple formats
// CRITICAL: Notion database properties must match expected schema
```

## Implementation Blueprint

### Data Models and Structure
```typescript
// New types for playlist sync
interface PlaylistSyncParams {
  playlistUrl: string;
  notionDatabaseId?: string;
  options?: {
    skipDuplicates?: boolean;
    includeDescriptions?: boolean;
    maxVideos?: number;
    customPrefix?: string;
  };
}

interface PlaylistSyncResult {
  playlistId: string;
  playlistTitle: string;
  totalVideos: number;
  processedVideos: number;
  skippedVideos: number;
  errors: string[];
  notionPages: string[];
}

interface PlaylistVideo {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: any;
  duration: string;
  viewCount: number;
  likeCount: number;
  position: number;
}
```

### List of Tasks
```yaml
Task 1: Enhance YouTubeService with Playlist Support
MODIFY: src/services/YouTubeService.ts
  - PATTERN: Follow existing async method patterns
  - ADD: getPlaylistItems() method with pagination
  - ADD: getPlaylistDetails() method
  - HANDLE: Rate limiting and error recovery

Task 2: Add Playlist URL Parsing Utility
CREATE: src/utils/playlist-parser.ts
  - PATTERN: Use existing validation utilities
  - IMPLEMENT: URL validation and ID extraction
  - HANDLE: Multiple YouTube URL formats

Task 3: Create Progress Tracking Utility
CREATE: src/utils/progress-tracker.ts
  - PATTERN: Use existing logging patterns
  - IMPLEMENT: Progress reporting for long operations
  - HANDLE: Cloudflare Workers timeout considerations

Task 4: Enhance Integration Service
MODIFY: src/services/YouTubeNotionIntegration.ts
  - PATTERN: Follow existing integration patterns
  - ADD: syncPlaylistToNotion() method
  - IMPLEMENT: Batch processing and duplicate detection

Task 5: Create MCP Tool
CREATE: src/tools/playlist-sync.ts
  - PATTERN: Follow existing MCP tool patterns
  - IMPLEMENT: Tool registration and handler
  - INCLUDE: Comprehensive input validation

Task 6: Add Type Definitions
CREATE: src/types/playlist.ts
  - PATTERN: Follow existing type patterns
  - DEFINE: Playlist-specific interfaces
  - ENSURE: Type safety throughout

Task 7: Register Tool in Main Server
MODIFY: src/index.ts
  - PATTERN: Follow existing tool registration
  - ADD: Playlist sync tool registration
  - ENSURE: Proper error handling

Task 8: Add Comprehensive Tests
CREATE: tests/playlist-sync.test.ts
  - PATTERN: Follow existing test patterns
  - TEST: Success and failure scenarios
  - MOCK: External API calls
```

### Integration Points
```yaml
MCP_SERVER:
  - register: "playlist_sync_tool in main server"
  - schema: "Zod schema for playlist URL validation"
  
APIS:
  - youtube: "Playlist items and video details endpoints"
  - notion: "Batch page creation with proper formatting"
  
UTILITIES:
  - validation: "URL format validation and sanitization"
  - security: "Rate limiting and API key protection"
  - logging: "Progress tracking and error reporting"
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
# Connect to: http://localhost:8000/mcp

# Test playlist sync:
# Tool: playlist_sync_tool
# Input: {"playlistUrl": "https://www.youtube.com/playlist?list=PLExample"}

# Expected: Tool appears in inspector and processes playlist correctly
```

### Level 4: Performance Test
```bash
# Test with large playlist
# Tool: playlist_sync_tool
# Input: {"playlistUrl": "https://www.youtube.com/playlist?list=PLLargePlaylist", "options": {"maxVideos": 100}}

# Expected: Handles large playlists within timeout limits
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] MCP tool registers correctly
- [ ] Tool handles valid playlist URLs
- [ ] Tool validates invalid URLs properly
- [ ] Progress tracking works for large playlists
- [ ] Duplicate detection functions correctly
- [ ] Error handling works for API failures
- [ ] Rate limiting respects API quotas
- [ ] Documentation updated in README
- [ ] Examples added to tool description

---

## Anti-Patterns to Avoid
- ❌ Don't create new service methods when existing ones can be extended
- ❌ Don't skip input validation for playlist URLs
- ❌ Don't ignore API rate limits and quotas
- ❌ Don't process entire large playlists without pagination
- ❌ Don't skip duplicate detection logic
- ❌ Don't forget progress tracking for long operations
- ❌ Don't ignore Cloudflare Workers timeout limitations
- ❌ Don't skip comprehensive error handling
- ❌ Don't hardcode database schemas or property names

## Confidence Score: 8/10

High confidence due to:
- Existing YouTube and Notion service patterns to follow
- Clear MCP tool registration patterns
- Comprehensive validation and testing approach
- Well-defined error handling strategy

Minor uncertainty on:
- Cloudflare Workers timeout handling for very large playlists
- Optimal batching strategy for API calls
- Progress reporting implementation details

Mitigated by:
- Incremental development approach
- Comprehensive testing at each stage
- Clear validation loops for early error detection
