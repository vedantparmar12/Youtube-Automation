import { z } from 'zod';
import { PRPContent, PRPTask } from '../types/prp-types';
import { VideoMetadata } from './youtube-client';

// Gemini API error
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

// Schema for validating Gemini response
const PRPResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  goal: z.string(),
  why: z.array(z.string()),
  what: z.string(),
  success_criteria: z.array(z.string()),
  context: z.object({
    documentation: z.array(z.object({
      type: z.enum(['url', 'file', 'docfile']),
      path: z.string(),
      why: z.string(),
    })),
    codebase_tree: z.string().nullable().optional(),
    gotchas: z.array(z.string()),
  }),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['create', 'modify', 'test', 'deploy', 'analyze', 'design', 'document', 'research', 'review', 'other']),
    file_path: z.string().nullable().optional(),
    pseudocode: z.string().nullable().optional(),
  })),
});

export class GeminiClient {
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000;

  constructor(
    private apiKey: string,
    private model: string = 'gemini-2.0-flash-exp'
  ) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
  }

  // Exponential backoff with jitter
  private async delay(attempt: number): Promise<void> {
    const delay = this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Make API request with retry logic
  private async makeRequest(prompt: string, maxTokens: number = 4096): Promise<any> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              topK: 1,
              topP: 1,
              maxOutputTokens: maxTokens,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE'
              }
            ]
          }),
        });

        if (response.status === 429) {
          // Rate limit exceeded
          if (attempt < this.maxRetries - 1) {
            await this.delay(attempt);
            continue;
          }
          throw new GeminiAPIError('Gemini API rate limit exceeded', 429);
        }

        if (!response.ok) {
          const error = await response.text();
          throw new GeminiAPIError(
            `Gemini API error: ${response.status} - ${error}`,
            response.status
          );
        }

        const result = await response.json();
        
        // Check if the response has candidates
        if (!result.candidates || result.candidates.length === 0) {
          throw new GeminiAPIError('No response generated from Gemini API');
        }

        // Extract the text from the response
        const text = result.candidates[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new GeminiAPIError('Invalid response structure from Gemini API');
        }

        return text;
      } catch (error) {
        if (error instanceof GeminiAPIError) {
          throw error;
        }
        if (attempt === this.maxRetries - 1) {
          throw new Error(`Gemini API request failed after ${this.maxRetries} attempts: ${error}`);
        }
        await this.delay(attempt);
      }
    }

    throw new Error('Gemini API request failed');
  }

  // Build prompt for PRP parsing
  private buildPRPParsingPrompt(transcript: string, metadata: VideoMetadata): string {
    return `You are an expert at parsing Product Requirements Prompts (PRPs) from video content.

Given the following video transcript and metadata, extract a structured PRP following this exact format:

Video Title: ${metadata.title}
Video Description: ${metadata.description}
Channel: ${metadata.channelTitle}
Published: ${metadata.publishedAt}

Transcript:
${transcript}

IMPORTANT: Return ONLY a valid JSON object (no markdown, no explanation, no code blocks) that matches this structure:

{
  "name": "Short descriptive name for the PRP",
  "description": "Brief overview of what this PRP is about",
  "goal": "Clear statement of what needs to be built or achieved",
  "why": ["Business value point 1", "Business value point 2", "..."],
  "what": "Description of user-visible behavior and features",
  "success_criteria": ["Measurable outcome 1", "Measurable outcome 2", "..."],
  "context": {
    "documentation": [
      {"type": "url", "path": "https://example.com/docs", "why": "Reason for reference"}
    ],
    "codebase_tree": "Optional file structure if mentioned",
    "gotchas": ["Potential issue 1", "Potential issue 2"]
  },
  "tasks": [
    {
      "title": "Task title",
      "description": "What needs to be done",
      "type": "create|modify|test|deploy|analyze|design|document|research|review|other",
      "file_path": "path/to/file.ts (optional - use null if not mentioned)",
      "pseudocode": "Any code snippets or pseudocode mentioned (optional - use null if not mentioned)"
    }
  ]
}

Extract as much relevant information as possible from the transcript. If certain sections are not explicitly mentioned, infer reasonable values based on the content. Ensure all arrays have at least one item.`;
  }

  // Parse PRP content from video transcript
  async parsePRPContent(transcript: string, metadata: VideoMetadata): Promise<PRPContent> {
    const prompt = this.buildPRPParsingPrompt(transcript, metadata);
    
    try {
      const response = await this.makeRequest(prompt);

      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.substring(7);
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.substring(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
      }
      cleanedResponse = cleanedResponse.trim();

      // Parse and validate the JSON response
      const parsedContent = JSON.parse(cleanedResponse);
      const validated = PRPResponseSchema.parse(parsedContent);

      // Transform to PRPContent format (adding IDs will be done at storage time)
      return {
        name: validated.name,
        description: validated.description,
        goal: validated.goal,
        why: validated.why,
        what: validated.what,
        success_criteria: validated.success_criteria,
        context: validated.context,
        tasks: validated.tasks.map((task, index) => ({
          id: '', // Will be assigned when stored
          prp_id: '', // Will be assigned when stored
          order: index + 1,
          title: task.title,
          description: task.description,
          type: task.type,
          file_path: task.file_path || null,
          pseudocode: task.pseudocode || null,
          status: 'pending' as const,
        })),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid PRP structure from AI: ${error.message}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON response from AI: ${error.message}`);
      }
      throw error;
    }
  }

  // Extract additional tasks from existing PRP content
  async extractTasks(prpContent: PRPContent, maxTasks: number = 20): Promise<PRPTask[]> {
    const prompt = `Given the following PRP (Product Requirements Prompt), extract ${maxTasks} detailed implementation tasks.

PRP Name: ${prpContent.name}
Goal: ${prpContent.goal}
What: ${prpContent.what}

Existing tasks count: ${prpContent.tasks?.length || 0}

Please provide ${maxTasks} additional detailed tasks that would help implement this PRP. Focus on specific, actionable tasks.

Return ONLY a valid JSON array (no markdown, no explanation, no code blocks) with this structure:

[
  {
    "title": "Specific task title",
    "description": "Detailed description of what needs to be done",
    "type": "create|modify|test|deploy|analyze|design|document|research|review|other",
    "file_path": "suggested/path/to/file.ts (optional - use null if not applicable)",
    "pseudocode": "// Example implementation\\nconst example = () => { ... } (optional - use null if not applicable)"
  }
]`;

    try {
      const response = await this.makeRequest(prompt, 2048);

      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.substring(7);
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.substring(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
      }
      cleanedResponse = cleanedResponse.trim();

      const tasks = JSON.parse(cleanedResponse);
      
      if (!Array.isArray(tasks)) {
        throw new Error('Expected array of tasks from AI');
      }

      // Transform to PRPTask format
      return tasks.slice(0, maxTasks).map((task, index) => ({
        id: '', // Will be assigned when stored
        prp_id: '', // Will be assigned when stored
        order: (prpContent.tasks?.length || 0) + index + 1,
        title: task.title || `Task ${index + 1}`,
        description: task.description || '',
        type: task.type || 'other',
        file_path: task.file_path || null,
        pseudocode: task.pseudocode || null,
        status: 'pending' as const,
      }));
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON response from AI: ${error.message}`);
      }
      throw error;
    }
  }

  // Summarize PRP content for display
  async summarizePRP(prpContent: PRPContent): Promise<string> {
    const prompt = `Provide a brief 2-3 sentence summary of this PRP:

Name: ${prpContent.name}
Goal: ${prpContent.goal}
Tasks: ${prpContent.tasks?.length || 0} tasks defined

Return only the summary text, no formatting, no markdown.`;

    const response = await this.makeRequest(prompt, 500);

    return response.trim();
  }
}