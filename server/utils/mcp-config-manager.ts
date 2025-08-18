import fs from "fs/promises";
import os from "os";
import path from "path";
import {
  type MCPOperationResult,
  type MCPServerConfig,
  type MCPSettings,
} from "../types/mcp-config.js";

/**
 * MCP配置管理器
 * 用于管理qwen-cli的MCP服务器配置
 */
export class MCPConfigManager {
  private configPath: string;

  constructor(configPath?: string) {
    if (configPath) {
      this.configPath = configPath;
    } else {
      // 默认使用用户主目录下的.qwen/settings.json
      this.configPath = path.join(os.homedir(), ".qwen", "settings.json");
    }
  }

  /**
   * 获取配置文件路径
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * 确保配置文件和目录存在
   */
  private async ensureConfigFile(): Promise<void> {
    const dir = path.dirname(this.configPath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }

    try {
      await fs.access(this.configPath);
    } catch {
      // 如果文件不存在，创建默认配置文件
      const defaultConfig: MCPSettings = { mcpServers: {} };
      await fs.writeFile(
        this.configPath,
        JSON.stringify(defaultConfig, null, 2)
      );
    }
  }

  /**
   * 读取配置文件
   */
  private async readConfig(): Promise<MCPSettings> {
    await this.ensureConfigFile();
    try {
      const content = await fs.readFile(this.configPath, "utf-8");
      const config = JSON.parse(content);
      return {
        ...config,
        mcpServers: config.mcpServers || {},
      };
    } catch (error) {
      throw new Error(`Failed to read config file: ${error}`);
    }
  }

  /**
   * 保存配置文件
   */
  private async saveConfig(config: MCPSettings): Promise<void> {
    await this.ensureConfigFile();
    try {
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config file: ${error}`);
    }
  }

  /**
   * 添加MCP服务器配置
   * @param name 服务器名称
   * @param config 服务器配置
   */
  async addServer(
    name: string,
    config: MCPServerConfig
  ): Promise<MCPOperationResult> {
    try {
      const settings = await this.readConfig();

      if (settings.mcpServers[name]) {
        return {
          success: false,
          message: `Server "${name}" already exists`,
          error: "DUPLICATE_NAME",
        };
      }

      settings.mcpServers[name] = config;
      await this.saveConfig(settings);

      return {
        success: true,
        message: `Server "${name}" added successfully`,
        data: { name, config },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add server "${name}"`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 移除MCP服务器配置
   * @param name 服务器名称
   */
  async removeServer(name: string): Promise<MCPOperationResult> {
    try {
      const settings = await this.readConfig();

      if (!settings.mcpServers[name]) {
        return {
          success: false,
          message: `Server "${name}" not found`,
          error: "NOT_FOUND",
        };
      }

      const removedConfig = settings.mcpServers[name];
      delete settings.mcpServers[name];
      await this.saveConfig(settings);

      return {
        success: true,
        message: `Server "${name}" removed successfully`,
        data: { name, config: removedConfig },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to remove server "${name}"`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 列出所有MCP服务器配置
   */
  async listServers(): Promise<MCPOperationResult> {
    try {
      const settings = await this.readConfig();
      const servers = Object.entries(settings.mcpServers).map(
        ([name, config]) => ({
          name,
          config,
        })
      );

      return {
        success: true,
        message: "Servers listed successfully",
        data: servers,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to list servers",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 获取特定MCP服务器配置
   * @param name 服务器名称
   */
  async getServer(name: string): Promise<MCPOperationResult> {
    try {
      const settings = await this.readConfig();
      const config = settings.mcpServers[name];

      if (!config) {
        return {
          success: false,
          message: `Server "${name}" not found`,
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: `Server "${name}" retrieved successfully`,
        data: { name, config },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get server "${name}"`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 更新MCP服务器配置
   * @param name 服务器名称
   * @param config 新配置
   */
  async updateServer(
    name: string,
    config: MCPServerConfig
  ): Promise<MCPOperationResult> {
    try {
      const settings = await this.readConfig();

      if (!settings.mcpServers[name]) {
        return {
          success: false,
          message: `Server "${name}" not found`,
          error: "NOT_FOUND",
        };
      }

      settings.mcpServers[name] = config;
      await this.saveConfig(settings);

      return {
        success: true,
        message: `Server "${name}" updated successfully`,
        data: { name, config },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update server "${name}"`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 检查服务器是否存在
   * @param name 服务器名称
   */
  async serverExists(name: string): Promise<boolean> {
    try {
      const settings = await this.readConfig();
      return !!settings.mcpServers[name];
    } catch {
      return false;
    }
  }

  /**
   * 获取服务器数量
   */
  async getServerCount(): Promise<number> {
    try {
      const settings = await this.readConfig();
      return Object.keys(settings.mcpServers).length;
    } catch {
      return 0;
    }
  }
}

/**
 * 便捷函数：快速创建配置管理器实例
 */
export function createMCPConfigManager(configPath?: string): MCPConfigManager {
  return new MCPConfigManager(configPath);
}

/**
 * 便捷函数：添加服务器
 */
export async function addMCPServer(
  name: string,
  config: MCPServerConfig,
  configPath?: string
): Promise<MCPOperationResult> {
  const manager = createMCPConfigManager(configPath);
  return manager.addServer(name, config);
}

/**
 * 便捷函数：移除服务器
 */
export async function removeMCPServer(
  name: string,
  configPath?: string
): Promise<MCPOperationResult> {
  const manager = createMCPConfigManager(configPath);
  return manager.removeServer(name);
}

/**
 * 便捷函数：列出服务器
 */
export async function listMCPServers(
  configPath?: string
): Promise<MCPOperationResult> {
  const manager = createMCPConfigManager(configPath);
  return manager.listServers();
}

/**
 * 便捷函数：获取服务器
 */
export async function getMCPServer(
  name: string,
  configPath?: string
): Promise<MCPOperationResult> {
  const manager = createMCPConfigManager(configPath);
  return manager.getServer(name);
}
