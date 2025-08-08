/**
 * Configuration interface for the Mapbox MCP Server
 * @interface Config
 */
export interface Config {
  /** Mapbox API access token for authentication */
  accessToken: string;
  /** Port number for HTTP server */
  port: number;
  /** Current environment mode */
  nodeEnv: 'development' | 'production';
  /** Convenience flag for production environment */
  isProduction: boolean;
}

/**
 * Loads and validates configuration from environment variables
 * @returns {Config} Validated configuration object
 * @throws {Error} If required environment variables are missing
 */
export function loadConfig(): Config {
  const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MAPBOX_ACCESS_TOKEN environment variable is required');
  }

  const nodeEnv =
    process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const port = parseInt(process.env.PORT || '3001', 10);

  return {
    accessToken,
    port,
    nodeEnv,
    isProduction: nodeEnv === 'production'
  };
}
