import {
  type MCPOperationResult,
  type MCPServerConfig,
} from "../types/mcp-config.js";
/**
 * MCP配置管理器
 * 用于管理gemini-cli的MCP服务器配置
 */
export declare class MCPConfigManager {
  private configPath;
  constructor(configPath?: string);
  /**
   * 获取配置文件路径
   */
  getConfigPath(): string;
  /**
   * 确保配置文件和目录存在
   */
  private ensureConfigFile;
  /**
   * 读取配置文件
   */
  private readConfig;
  /**
   * 保存配置文件
   */
  private saveConfig;
  /**
   * 添加MCP服务器配置
   * @param name 服务器名称
   * @param config 服务器配置
   */
  addServer(name: string, config: MCPServerConfig): Promise<MCPOperationResult>;
  /**
   * 移除MCP服务器配置
   * @param name 服务器名称
   */
  removeServer(name: string): Promise<MCPOperationResult>;
  /**
   * 列出所有MCP服务器配置
   */
  listServers(): Promise<MCPOperationResult>;
  /**
   * 获取特定MCP服务器配置
   * @param name 服务器名称
   */
  getServer(name: string): Promise<MCPOperationResult>;
  /**
   * 更新MCP服务器配置
   * @param name 服务器名称
   * @param config 新配置
   */
  updateServer(
    name: string,
    config: MCPServerConfig,
  ): Promise<MCPOperationResult>;
  /**
   * 检查服务器是否存在
   * @param name 服务器名称
   */
  serverExists(name: string): Promise<boolean>;
  /**
   * 获取服务器数量
   */
  getServerCount(): Promise<number>;
}
/**
 * 便捷函数：快速创建配置管理器实例
 */
export declare function createMCPConfigManager(
  configPath?: string,
): MCPConfigManager;
/**
 * 便捷函数：添加服务器
 */
export declare function addMCPServer(
  name: string,
  config: MCPServerConfig,
  configPath?: string,
): Promise<MCPOperationResult>;
/**
 * 便捷函数：移除服务器
 */
export declare function removeMCPServer(
  name: string,
  configPath?: string,
): Promise<MCPOperationResult>;
/**
 * 便捷函数：列出服务器
 */
export declare function listMCPServers(
  configPath?: string,
): Promise<MCPOperationResult>;
/**
 * 便捷函数：获取服务器
 */
export declare function getMCPServer(
  name: string,
  configPath?: string,
): Promise<MCPOperationResult>;
//# sourceMappingURL=mcp-config-manager.d.ts.map
