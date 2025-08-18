import fs from "fs/promises";
import path from "path";
import os from "os";
import {} from "../types/mcp-config.js";
export class MCPConfigManager {
    configPath;
    constructor(configPath) {
        if (configPath) {
            this.configPath = configPath;
        }
        else {
            this.configPath = path.join(os.homedir(), ".gemini", "settings.json");
        }
    }
    getConfigPath() {
        return this.configPath;
    }
    async ensureConfigFile() {
        const dir = path.dirname(this.configPath);
        try {
            await fs.access(dir);
        }
        catch {
            await fs.mkdir(dir, { recursive: true });
        }
        try {
            await fs.access(this.configPath);
        }
        catch {
            const defaultConfig = { mcpServers: {} };
            await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2));
        }
    }
    async readConfig() {
        await this.ensureConfigFile();
        try {
            const content = await fs.readFile(this.configPath, "utf-8");
            const config = JSON.parse(content);
            return {
                ...config,
                mcpServers: config.mcpServers || {},
            };
        }
        catch (error) {
            throw new Error(`Failed to read config file: ${error}`);
        }
    }
    async saveConfig(config) {
        await this.ensureConfigFile();
        try {
            await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
        }
        catch (error) {
            throw new Error(`Failed to save config file: ${error}`);
        }
    }
    async addServer(name, config) {
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
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to add server "${name}"`,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async removeServer(name) {
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
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to remove server "${name}"`,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async listServers() {
        try {
            const settings = await this.readConfig();
            const servers = Object.entries(settings.mcpServers).map(([name, config]) => ({
                name,
                config,
            }));
            return {
                success: true,
                message: "Servers listed successfully",
                data: servers,
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Failed to list servers",
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async getServer(name) {
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
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to get server "${name}"`,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async updateServer(name, config) {
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
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to update server "${name}"`,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async serverExists(name) {
        try {
            const settings = await this.readConfig();
            return !!settings.mcpServers[name];
        }
        catch {
            return false;
        }
    }
    async getServerCount() {
        try {
            const settings = await this.readConfig();
            return Object.keys(settings.mcpServers).length;
        }
        catch {
            return 0;
        }
    }
}
export function createMCPConfigManager(configPath) {
    return new MCPConfigManager(configPath);
}
export async function addMCPServer(name, config, configPath) {
    const manager = createMCPConfigManager(configPath);
    return manager.addServer(name, config);
}
export async function removeMCPServer(name, configPath) {
    const manager = createMCPConfigManager(configPath);
    return manager.removeServer(name);
}
export async function listMCPServers(configPath) {
    const manager = createMCPConfigManager(configPath);
    return manager.listServers();
}
export async function getMCPServer(name, configPath) {
    const manager = createMCPConfigManager(configPath);
    return manager.getServer(name);
}
//# sourceMappingURL=mcp-config-manager.js.map