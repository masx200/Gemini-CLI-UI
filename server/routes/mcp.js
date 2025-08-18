import express from "express";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { MCPConfigManager } from "../utils/mcp-config-manager.js";
const router = express.Router();
router.get("/cli/list", async (req, res) => {
    try {
        console.log("📋 Listing MCP servers using qwen cli");
        const { spawn } = await import("child_process");
        const process2 = spawn(process.env.qwen_PATH || "qwen", ["mcp", "list"], {
            stdio: ["pipe", "pipe", "pipe"],
        });
        let stdout = "";
        let stderr = "";
        process2.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        process2.stderr.on("data", (data) => {
            stderr += data.toString();
        });
        process2.on("close", (code) => {
            if (code === 0) {
                res.json({
                    success: true,
                    output: stdout,
                    servers: parseqwenListOutput(stdout),
                });
            }
            else {
                console.error("qwen cli error:", stderr);
                res
                    .status(500)
                    .json({ error: "qwen cli command failed", details: stderr });
            }
        });
        process2.on("error", (error) => {
            console.error("Error running qwen cli:", error);
            res
                .status(500)
                .json({ error: "Failed to run qwen cli", details: error.message });
        });
    }
    catch (error) {
        console.error("Error listing MCP servers via CLI:", error);
        res
            .status(500)
            .json({ error: "Failed to list MCP servers", details: error?.message });
    }
});
router.post("/cli/add", async (req, res) => {
    try {
        const { name, type = "stdio", command, args = [], url, headers = {}, env = {}, scope = "user", projectPath, } = req.body;
        console.log(`➕ Adding MCP server using qwen cli (${scope} scope):`, name);
        if (scope === "local" && projectPath) {
            console.log("📁 Running in project directory:", projectPath);
        }
        const configPath = scope == "user"
            ? path.join(os.homedir(), ".qwen", "settings.json")
            : path.join(projectPath, ".qwen", "settings.json");
        const mcm = new MCPConfigManager(configPath);
        if (type === "http") {
            const result = await mcm.addServer(name, {
                type,
                command,
                args,
                url,
                transport: "http",
                headers,
                env,
                httpUrl: url,
            });
            if (result.error) {
                return res.status(400).json({
                    error: "Failed to add MCP server",
                    details: result.error,
                });
            }
            else {
                return res.status(200).json({
                    success: true,
                    message: `Server "${name}" added successfully`,
                });
            }
        }
        else if (type === "sse") {
            const result = await mcm.addServer(name, {
                type,
                command,
                args,
                url,
                transport: "sse",
                headers,
                env,
            });
            if (result.error) {
                return res.status(400).json({
                    error: "Failed to add MCP server",
                    details: result.error,
                });
            }
            else {
                return res.status(200).json({
                    success: true,
                    message: `Server "${name}" added successfully`,
                });
            }
        }
        else {
            const result = await mcm.addServer(name, {
                type,
                command,
                args,
                url,
                transport: "stdio",
                headers,
                env,
            });
            if (result.error) {
                return res.status(400).json({
                    error: "Failed to add MCP server",
                    details: result.error,
                });
            }
            else {
                return res.status(200).json({
                    success: true,
                    message: `Server "${name}" added successfully`,
                });
            }
        }
    }
    catch (error) {
        console.error("Error adding MCP server via CLI:", error);
        res
            .status(500)
            .json({ error: "Failed to add MCP server", details: error?.message });
    }
});
router.post("/cli/add-json", async (req, res) => {
    try {
        const { name, jsonConfig, scope = "user", projectPath } = req.body;
        console.log("➕ Adding MCP server using JSON format:", name);
        let parsedConfig;
        try {
            parsedConfig =
                typeof jsonConfig === "string" ? JSON.parse(jsonConfig) : jsonConfig;
        }
        catch (parseError) {
            return res.status(400).json({
                error: "Invalid JSON configuration",
                details: parseError?.message,
            });
        }
        if (!parsedConfig.type) {
            return res.status(400).json({
                error: "Invalid configuration",
                details: "Missing required field: type",
            });
        }
        if (parsedConfig.type === "stdio" && !parsedConfig.command) {
            return res.status(400).json({
                error: "Invalid configuration",
                details: "stdio type requires a command field",
            });
        }
        if ((parsedConfig.type === "http" || parsedConfig.type === "sse") &&
            !parsedConfig.url) {
            return res.status(400).json({
                error: "Invalid configuration",
                details: `${parsedConfig.type} type requires a url field`,
            });
        }
        const { spawn } = await import("child_process");
        const cliArgs = ["mcp", "add-json", "--scope", scope, name];
        const jsonString = JSON.stringify(parsedConfig);
        cliArgs.push(jsonString);
        console.log("🔧 Running qwen cli command:", process.env.qwen_PATH || "qwen", cliArgs[0], cliArgs[1], cliArgs[2], cliArgs[3], cliArgs[4], jsonString);
        const spawnOptions = {
            stdio: ["pipe", "pipe", "pipe"],
        };
        if (scope === "local" && projectPath) {
            spawnOptions.cwd = projectPath;
            console.log("📁 Running in project directory:", projectPath);
        }
        const process2 = spawn(process.env.qwen_PATH || "qwen", cliArgs, spawnOptions);
        let stdout = "";
        let stderr = "";
        process2.stdout?.on("data", (data) => {
            stdout += data.toString();
        });
        process2.stderr?.on("data", (data) => {
            stderr += data.toString();
        });
        process2.on("close", (code) => {
            if (code === 0) {
                res.json({
                    success: true,
                    output: stdout,
                    message: `MCP server "${name}" added successfully via JSON`,
                });
            }
            else {
                console.error("qwen cli error:", stderr);
                res
                    .status(400)
                    .json({ error: "qwen cli command failed", details: stderr });
            }
        });
        process2.on("error", (error) => {
            console.error("Error running qwen cli:", error);
            res
                .status(500)
                .json({ error: "Failed to run qwen cli", details: error.message });
        });
    }
    catch (error) {
        console.error("Error adding MCP server via JSON:", error);
        res
            .status(500)
            .json({ error: "Failed to add MCP server", details: error?.message });
    }
});
router.delete("/cli/remove/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const { scope, projectPath } = req.query;
        let actualName = name;
        let actualScope = scope;
        if (name.includes(":")) {
            const [prefix, serverName] = name.split(":");
            actualName = serverName;
            actualScope = actualScope || prefix;
        }
        console.log("🗑️ Removing MCP server using qwen cli:", actualName, "scope:", actualScope);
        if (actualScope === "local") {
            console.log("📁 Running in project directory:", projectPath);
        }
        if (actualName) {
            const configPath = actualScope == "user"
                ? path.join(os.homedir(), ".qwen", "settings.json")
                :
                    path.join(projectPath, ".qwen", "settings.json");
            const mcm = new MCPConfigManager(configPath);
            const result = await mcm.removeServer(actualName);
            if (result.success) {
                res.json({
                    success: true,
                    message: `MCP server "${actualName}" removed successfully via JSON`,
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: `MCP server "${actualName}" not found` +
                        "\n" +
                        "error:" +
                        result.error,
                });
            }
        }
    }
    catch (error) {
        console.error("Error removing MCP server via CLI:", error);
        res
            .status(500)
            .json({ error: "Failed to remove MCP server", details: error?.message });
    }
});
router.get("/cli/get/:name", async (req, res) => {
    try {
        const { name } = req.params;
        console.log("📄 Getting MCP server details using qwen cli:", name);
        const { spawn } = await import("child_process");
        const process2 = spawn(process.env.qwen_PATH || "qwen", ["mcp", "get", name], {
            stdio: ["pipe", "pipe", "pipe"],
        });
        let stdout = "";
        let stderr = "";
        process2.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        process2.stderr.on("data", (data) => {
            stderr += data.toString();
        });
        process2.on("close", (code) => {
            if (code === 0) {
                res.json({
                    success: true,
                    output: stdout,
                    server: parseqwenGetOutput(stdout),
                });
            }
            else {
                console.error("qwen cli error:", stderr);
                res
                    .status(404)
                    .json({ error: "qwen cli command failed", details: stderr });
            }
        });
        process2.on("error", (error) => {
            console.error("Error running qwen cli:", error);
            res
                .status(500)
                .json({ error: "Failed to run qwen cli", details: error.message });
        });
    }
    catch (error) {
        console.error("Error getting MCP server details via CLI:", error);
        res.status(500).json({
            error: "Failed to get MCP server details",
            details: error?.message,
        });
    }
});
router.get("/config/read", async (req, res) => {
    try {
        console.log("📖 Reading MCP servers from qwen config files");
        const homeDir = os.homedir();
        const configPaths = [
            path.join(homeDir, ".qwen/settings.json"),
            path.join(homeDir, ".qwen", "settings.json"),
        ];
        let configData = null;
        let configPath = null;
        for (const filepath of configPaths) {
            try {
                const fileContent = await fs.readFile(filepath, "utf8");
                configData = JSON.parse(fileContent);
                configPath = filepath;
                console.log(`✅ Found qwen config at: ${filepath}`);
                break;
            }
            catch (error) {
                console.log(`ℹ️ Config not found or invalid at: ${filepath}`);
            }
        }
        if (!configData) {
            return res.json({
                success: false,
                message: "No qwen configuration file found",
                servers: [],
            });
        }
        const servers = [];
        if (configData.mcpServers &&
            typeof configData.mcpServers === "object" &&
            Object.keys(configData.mcpServers).length > 0) {
            console.log("🔍 Found user-scoped MCP servers:", Object.keys(configData.mcpServers));
            for (const [name, config] of Object.entries(configData.mcpServers)) {
                const server = {
                    id: name,
                    name: name,
                    type: "stdio",
                    scope: "user",
                    config: {},
                    raw: config,
                };
                if (config.httpUrl ||
                    config.type == "http" ||
                    config.transport == "http") {
                    server.type = "http";
                    server.config.httpUrl = config.httpUrl;
                    server.config.url = config.url;
                    server.config.headers = config.headers || {};
                }
                else if (config.command ||
                    config.type == "stdio" ||
                    config.transport == "stdio") {
                    server.type = "stdio";
                    server.config.command = config.command;
                    server.config.args = config.args || [];
                    server.config.env = config.env || {};
                }
                else if (config.url ||
                    config.type == "sse" ||
                    config.transport == "sse") {
                    server.type = "sse";
                    server.config.url = config.url;
                    server.config.headers = config.headers || {};
                }
                servers.push(server);
            }
        }
        const currentProjectPath = process.cwd();
        if (configData.projects && configData.projects[currentProjectPath]) {
            const projectConfig = configData.projects[currentProjectPath];
            if (projectConfig.mcpServers &&
                typeof projectConfig.mcpServers === "object" &&
                Object.keys(projectConfig.mcpServers).length > 0) {
                console.log(`🔍 Found local-scoped MCP servers for ${currentProjectPath}:`, Object.keys(projectConfig.mcpServers));
                for (const [name, config] of Object.entries(projectConfig.mcpServers)) {
                    const server = {
                        id: `local:${name}`,
                        name: name,
                        type: "stdio",
                        scope: "local",
                        projectPath: currentProjectPath,
                        config: {},
                        raw: config,
                    };
                    if (config.command) {
                        server.type = "stdio";
                        server.config.command = config.command;
                        server.config.args = config.args || [];
                        server.config.env = config.env || {};
                    }
                    else if (config.url) {
                        server.type = config.transport || "http";
                        server.config.url = config.url;
                        server.config.headers = config.headers || {};
                    }
                    servers.push(server);
                }
            }
        }
        console.log(`📋 Found ${servers.length} MCP servers in config`);
        res.json({
            success: true,
            configPath: configPath,
            servers: servers,
        });
    }
    catch (error) {
        console.error("Error reading qwen config:", error);
        res.status(500).json({
            error: "Failed to read qwen configuration",
            details: error?.message,
        });
    }
});
function parseqwenListOutput(output) {
    const servers = [];
    const lines = output.split("\n").filter((line) => line.trim());
    for (const line of lines) {
        if (line.includes("Checking MCP server health"))
            continue;
        if (line.includes(":")) {
            const colonIndex = line.indexOf(":");
            const name = line.substring(0, colonIndex).trim();
            if (!name)
                continue;
            const rest = line.substring(colonIndex + 1).trim();
            let description = rest;
            let status = "unknown";
            let type = "stdio";
            if (rest.includes("✓") || rest.includes("✗")) {
                const statusMatch = rest.match(/(.*?)\s*-\s*([✓✗].*)$/);
                if (statusMatch) {
                    description = statusMatch[1]?.trim();
                    status = statusMatch[2]?.includes("✓") ? "connected" : "failed";
                }
            }
            if (description?.startsWith("http://") ||
                description?.startsWith("https://")) {
                type = "http";
            }
            servers.push({
                name,
                type,
                status: status || "active",
                description,
            });
        }
    }
    console.log("🔍 Parsed qwen cli servers:", servers);
    return servers;
}
function parseqwenGetOutput(output) {
    try {
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        const server = { raw_output: output };
        const lines = output.split("\n");
        for (const line of lines) {
            if (line.includes("Name:")) {
                server.name = line.split(":")[1]?.trim();
            }
            else if (line.includes("Type:")) {
                server.type = line.split(":")[1]?.trim();
            }
            else if (line.includes("Command:")) {
                server.command = line.split(":")[1]?.trim();
            }
            else if (line.includes("URL:")) {
                server.url = line.split(":")[1]?.trim();
            }
        }
        return server;
    }
    catch (error) {
        return { raw_output: output, parse_error: error.message };
    }
}
export default router;
//# sourceMappingURL=mcp.js.map