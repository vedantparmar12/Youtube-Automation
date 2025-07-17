1|name: "YouTube-Notion Integration PRP Template"
2|description: |
3|
4|## Purpose
5|Template for implementing YouTube to Notion integration features using MCP with comprehensive context and validation loops.
6|
7|## Core Principles
8|1. **Context is King**: Include ALL documentation, examples, and caveats
9|2. **Validation Loops**: Ensure executable tests and lints
10|3. **Information Dense**: Use keywords and patterns from the codebase
11|4. **Progressive Success**: Start simple, validate, then enhance
12|
13|---
14|
15|## Goal
16|[Implement integration feature between YouTube and Notion using MCP server]
17|
18|## Why
19|- **Business value**: Streamlined workflows for content management
20|- **Integration**: Efficiently link video content to structured databases
21|- **Problems solved**: Centralizes media content with database entries
22|
23|## What
24|[Describe functionality and technical requirements]
25|
26|### Success Criteria
27|- [ ] [Define measurable outcomes]
28|
29|## All Needed Context
30|
31|### Documentation & References
32|```yaml
33|# MUST READ - Include these in your context window
34|- url: https://developers.notion.com/
35|  why: Notion API integration details
36|  
37|- url: https://developers.google.com/youtube/
38|  why: YouTube Data API usage
39|  
40|- file: src/services/YouTubeNotionIntegration.ts
41|  why: Existing integration patterns
42|  
43|```
44|
45|### Current Codebase Tree (run `tree` for overview)
46|```bash
47|
48|```
49|
50|### Desired Codebase Tree
51|```bash
52|
53|```
54|
55|### Known Gotchas
56|```python
57|# CRITICAL: Ensure API keys are not hardcoded
58|# CRITICAL: API requests should handle rate limits properly
59|# CRITICAL: Use dotenv for environment variable management
60|# CRITICAL: Implement robust error handling for API interactions
61|```
62|
63|## Implementation Blueprint
64|
65|### Data models and structure
66|
67|```typescript
68|interface YouTubeVideo {
69|    id: string;
70|    title: string;
71|    channel: string;
72|    published: Date;
73|    duration: string;
74|    views: number;
75|    likes: number;
76|    url: string;
77|}
78|
79|interface NotionPage {
80|    id: string;
81|    title: string;
82|    properties: Record<string, any>;
83|}
84|```
85|
86|### Tasks for PRP
87|
88|```yaml
89|Task 1: Setup Configuration and Environment
90|- CREATE config/.env.example
91|- PATTERN: Use dotenv
92|
93|Task 2: Implement YouTube Search Tool
94|- MODIFY src/services/YouTubeService.ts
95|- PATTERN: async function with axios for HTTP requests
96|
97|Task 3: Implement Notion Page Creation
98|- MODIFY src/services/NotionService.ts
99|- PATTERN: async function with notionhq client
100|
101|Task 4: Error Handling and Validation
102|- ADD error handling in existing functions
103|
104|Task 5: Tests and Validation
105|- Ensure 80%+ test coverage
106|- ADD validation tests
107|```
108|
109|### Integration Points
110|```yaml
111|DATABASE:
112|  - Ensure database entries match Notion structure
113|
114|API:
115|  - Register YouTube and Notion credentials in Cloudflare
116|```
117|
118|## Validation Loop
119|
120|### Level 1: Syntax & Style
121|```bash
122|# Type-check, lint, and format existing code
123|npm run type-check
124|npm run lint
125|npm run format
126|```
127|
128|### Level 2: Unit Tests & Integration Tests
129|```bash
130|# Run test suite
131|npm run test:run
132|```
133|
134|### Level 3: Deployment Test
135|```bash
136|# Ensure Cloudflare Workers deploy correctly
137|npm run deploy
138|```
139|
140|## Final Validation Checklist
141|- [ ] No linting errors
142|- [ ] All tests pass with 80%+ coverage
143|- [ ] MCp integrations function correctly
144|- [ ] Readme updated with new feature details
145|
