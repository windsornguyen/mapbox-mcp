#!/usr/bin/env node

import { config } from 'dotenv';
config();

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { getAllTools } from './tools/toolRegistry.js';
import { patchGlobalFetch } from './utils/requestUtils.js';
import { getVersionInfo } from './utils/versionUtils.js';

let serverVersionInfo = getVersionInfo();
patchGlobalFetch(serverVersionInfo);

class MapboxMCPServer {
  private server: McpServer;

  constructor() {
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

    this.setupTools();
  }

  private setupTools() {
    // Register all tools from the registry
    getAllTools().forEach((tool) => {
      tool.installTo(this.server);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Mapbox MCP Server running on stdio');
  }

  getServer() {
    return this.server;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options: { port?: number; headless?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && i + 1 < args.length) {
      options.port = parseInt(args[i + 1]!, 10);
      i++;
    } else if (args[i] === '--headless') {
      options.headless = true;
    }
  }

  return options;
}

// Session storage for streamable HTTP
const streamableSessions = new Map<string, { transport: any; server: any }>();

// Create a new server instance
function createMapboxServerInstance() {
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

  // Register all tools from the registry
  getAllTools().forEach((tool) => {
    tool.installTo(serverInstance);
  });

  return serverInstance;
}

// HTTP server setup
function startHttpServer(port: number) {
  const httpServer = createServer();

  httpServer.on('request', async (req, res) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);

    if (url.pathname === '/sse') {
      await handleSSE(req, res);
    } else if (url.pathname === '/mcp') {
      await handleStreamable(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  httpServer.listen(port, () => {
    console.log(`Mapbox MCP Server listening on http://localhost:${port}`);
    console.log('Put this in your client config:');
    console.log(
      JSON.stringify(
        {
          mcpServers: {
            mapbox: {
              url: `http://localhost:${port}/sse`
            }
          }
        },
        null,
        2
      )
    );
    console.log(
      'If your client supports streamable HTTP, you can use the /mcp endpoint instead.'
    );
  });

  return httpServer;
}

// SSE transport handler
async function handleSSE(_req: any, res: any) {
  const serverInstance = createMapboxServerInstance();
  const transport = new SSEServerTransport('/sse', res);
  try {
    await serverInstance.connect(transport);
  } catch (error) {
    console.error('SSE connection error:', error);
  }
}

// Streamable HTTP transport handler
async function handleStreamable(req: any, res: any) {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (sessionId) {
    // Use existing session
    const session = streamableSessions.get(sessionId);
    if (!session) {
      res.statusCode = 404;
      res.end('Session not found');
      return;
    }
    return await session.transport.handleRequest(req, res);
  }

  // Create new session for initialization
  if (req.method === 'POST') {
    const serverInstance = createMapboxServerInstance();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        streamableSessions.set(sessionId, {
          transport,
          server: serverInstance
        });
        console.log('New Mapbox session created:', sessionId);
      }
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        streamableSessions.delete(transport.sessionId);
        console.log('Mapbox session closed:', transport.sessionId);
      }
    };

    try {
      await serverInstance.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error('Streamable HTTP connection error:', error);
    }
    return;
  }

  res.statusCode = 400;
  res.end('Invalid request');
}

// Main server function
async function runServer() {
  const options = parseArgs();

  if (options.port) {
    // HTTP mode
    startHttpServer(options.port);
  } else {
    // STDIO mode (default)
    const server = new MapboxMCPServer();
    await server.run();
  }
}

runServer().catch((error) => {
  console.error('Fatal error running Mapbox server:', error);
  process.exit(1);
});
