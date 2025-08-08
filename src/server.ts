import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getAllTools } from './tools/toolRegistry.js';
import { patchGlobalFetch } from './utils/requestUtils.js';
import { getVersionInfo } from './utils/versionUtils.js';

const serverVersionInfo = getVersionInfo();
patchGlobalFetch(serverVersionInfo);

/**
 * Mapbox MCP Server class for managing server lifecycle and tool registration
 */
export class MapboxServer {
  private server: McpServer;

  /**
   * Creates a new MapboxServer instance
   * @param {string} accessToken - Mapbox access token for API authentication
   */
  constructor(accessToken: string) {
    this.server = new McpServer(
      {
        name: serverVersionInfo.name,
        version: serverVersionInfo.version
      },
      {
        capabilities: {
          logging: {}
        }
      }
    );

    // Store access token for tools to use
    process.env.MAPBOX_ACCESS_TOKEN = accessToken;

    this.setupTools();
    this.setupErrorHandling();
  }

  /**
   * Registers all tools from the tool registry
   * @private
   */
  private setupTools(): void {
    getAllTools().forEach((tool) => {
      tool.installTo(this.server);
    });
  }

  /**
   * Configures error handling and graceful shutdown
   * @private
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Gets the underlying MCP server instance
   * @returns {McpServer} The MCP server instance
   */
  getServer(): McpServer {
    return this.server;
  }
}

/**
 * Creates a standalone server instance for HTTP transport
 * @param {string} accessToken - Mapbox access token
 * @returns {McpServer} Standalone server instance
 */
export function createStandaloneServer(accessToken: string): McpServer {
  const serverInstance = new McpServer(
    {
      name: serverVersionInfo.name,
      version: serverVersionInfo.version
    },
    {
      capabilities: {
        logging: {}
      }
    }
  );

  // Store access token for tools to use
  process.env.MAPBOX_ACCESS_TOKEN = accessToken;

  // Register all tools from the registry
  getAllTools().forEach((tool) => {
    tool.installTo(serverInstance);
  });

  return serverInstance;
}
