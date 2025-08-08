import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

/**
 * Runs the MCP server using STDIO transport
 * Used for local development and debugging
 * @param {McpServer} server - MCP server instance to connect
 * @returns {Promise<void>}
 */
export async function runStdioTransport(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Mapbox MCP server running on stdio');
}
