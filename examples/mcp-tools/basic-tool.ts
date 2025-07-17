import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../../src/utils/logger.js';
import { validateInput } from '../../src/utils/validation.js';

/**
 * Example MCP tool implementation pattern
 * This serves as a template for creating new MCP tools
 */

// Define the input schema using Zod
const BasicToolSchema = z.object({
  message: z.string().describe("Input message to process"),
  options: z.object({
    uppercase: z.boolean().optional().describe("Convert to uppercase"),
    prefix: z.string().optional().describe("Add prefix to message"),
  }).optional(),
});

// Type inference from schema
type BasicToolInput = z.infer<typeof BasicToolSchema>;

/**
 * Basic MCP tool registration pattern
 * @param server - MCP server instance
 */
export function registerBasicTool(server: Server) {
  server.addTool({
    name: "basic_tool",
    description: "A basic example tool that processes text input",
    inputSchema: zodToJsonSchema(BasicToolSchema),
    handler: async (params): Promise<{ content: Array<{ type: string; text: string }> }> => {
      try {
        // Step 1: Validate input parameters
        const validated = BasicToolSchema.safeParse(params);
        if (!validated.success) {
          logger.error('Invalid input parameters', { 
            error: validated.error.errors,
            params 
          });
          throw new Error(`Invalid parameters: ${validated.error.errors.map(e => e.message).join(', ')}`);
        }

        const { message, options = {} } = validated.data;

        // Step 2: Log the operation
        logger.info('Basic tool execution started', { 
          message: message.substring(0, 100), // Truncate for logging
          options 
        });

        // Step 3: Process the input
        let result = message;
        
        if (options.prefix) {
          result = `${options.prefix}: ${result}`;
        }
        
        if (options.uppercase) {
          result = result.toUpperCase();
        }

        // Step 4: Log success and return result
        logger.info('Basic tool execution completed', { 
          originalLength: message.length,
          resultLength: result.length,
          options 
        });

        return {
          content: [
            {
              type: "text",
              text: result
            }
          ]
        };

      } catch (error) {
        // Step 5: Handle errors gracefully
        logger.error('Basic tool execution failed', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          params 
        });
        
        throw new Error(`Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
}

/**
 * Alternative pattern for tools that need dependency injection
 */
export class BasicToolHandler {
  constructor(private dependencies: {
    logger: typeof logger;
    validator: typeof validateInput;
  }) {}

  async handle(params: BasicToolInput): Promise<string> {
    // Validate input
    const validation = this.dependencies.validator(params, BasicToolSchema);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }

    // Process with dependencies
    this.dependencies.logger.info('Processing with dependencies', { params });
    
    const { message, options = {} } = params;
    let result = message;
    
    if (options.prefix) {
      result = `${options.prefix}: ${result}`;
    }
    
    if (options.uppercase) {
      result = result.toUpperCase();
    }

    return result;
  }
}

/**
 * Example of registering the dependency-injected tool
 */
export function registerBasicToolWithDI(server: Server) {
  const handler = new BasicToolHandler({
    logger,
    validator: validateInput,
  });

  server.addTool({
    name: "basic_tool_di",
    description: "Basic tool with dependency injection pattern",
    inputSchema: zodToJsonSchema(BasicToolSchema),
    handler: async (params) => {
      const result = await handler.handle(params);
      return {
        content: [{ type: "text", text: result }]
      };
    },
  });
}

/**
 * Pattern for tools that need async initialization
 */
export class AsyncBasicTool {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    logger.info('Initializing async basic tool');
    
    // Simulate async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.initialized = true;
    logger.info('Async basic tool initialized');
  }

  async execute(params: BasicToolInput): Promise<string> {
    await this.initialize();
    
    const { message, options = {} } = params;
    let result = message;
    
    if (options.prefix) {
      result = `${options.prefix}: ${result}`;
    }
    
    if (options.uppercase) {
      result = result.toUpperCase();
    }

    return result;
  }
}

/**
 * Key patterns demonstrated in this example:
 * 
 * 1. **Schema Definition**: Use Zod for input validation
 * 2. **Type Safety**: Infer types from schemas
 * 3. **Error Handling**: Comprehensive try/catch with logging
 * 4. **Input Validation**: Always validate before processing
 * 5. **Structured Logging**: Log operations with context
 * 6. **Dependency Injection**: Option for testable code
 * 7. **Async Initialization**: Pattern for tools needing setup
 * 8. **Consistent Return Format**: Standard MCP response structure
 * 
 * Use this as a template for creating new MCP tools!
 */
