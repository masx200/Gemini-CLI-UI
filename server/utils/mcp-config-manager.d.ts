import {
  type MCPOperationResult,
  type MCPServerConfig,
} from "../types/mcp-config.js";
export declare class MCPConfigManager {
  private configPath;
  constructor(configPath?: string);
  getConfigPath(): string;
  private ensureConfigFile;
  private readConfig;
  private saveConfig;
  addServer(name: string, config: MCPServerConfig): Promise<MCPOperationResult>;
  removeServer(name: string): Promise<MCPOperationResult>;
  listServers(): Promise<MCPOperationResult>;
  getServer(name: string): Promise<MCPOperationResult>;
  updateServer(
    name: string,
    config: MCPServerConfig,
  ): Promise<MCPOperationResult>;
  serverExists(name: string): Promise<boolean>;
  getServerCount(): Promise<number>;
}
export declare function createMCPConfigManager(
  configPath?: string,
): MCPConfigManager;
export declare function addMCPServer(
  name: string,
  config: MCPServerConfig,
  configPath?: string,
): Promise<MCPOperationResult>;
export declare function removeMCPServer(
  name: string,
  configPath?: string,
): Promise<MCPOperationResult>;
export declare function listMCPServers(
  configPath?: string,
): Promise<MCPOperationResult>;
export declare function getMCPServer(
  name: string,
  configPath?: string,
): Promise<MCPOperationResult>;
//# sourceMappingURL=mcp-config-manager.d.ts.map
