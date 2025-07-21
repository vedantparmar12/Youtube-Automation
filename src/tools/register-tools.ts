import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Props } from "../types";
import { registerYouTubeTools } from "./youtube-tools";
import { registerNotionTools } from "./notion-tools";
import { registerPRPTools } from "./prp-tools";

/**
 * Register all MCP tools based on user permissions
 */
export function registerAllTools(server: McpServer, env: Env, props: Props) {
	// Register PRP-specific tools
	registerYouTubeTools(server, env, props);
	registerNotionTools(server, env, props);
	registerPRPTools(server, env, props);
	
	// Future tools can be registered here
	// registerDatabaseTools(server, env, props);
	// registerOtherTools(server, env, props);
}