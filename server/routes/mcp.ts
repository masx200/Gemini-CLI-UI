import type { SpawnOptions } from "child_process";
import express from "express";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { MCPConfigManager } from "../utils/mcp-config-manager.js";
// import { fileURLToPath } from "url";

const router = express.Router();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// qwen cli command routes

// GET /api/mcp/cli/list - List MCP servers using qwen cli
router.get("/cli/list", async (req, res) => {
  try {
    console.log("📋 Listing MCP servers using qwen cli");

    const { spawn } = await import("child_process");
    // const { promisify } = await import("util");
    // const exec = promisify(spawn);

    const process2 = spawn(
      //@ts-ignore
      process.env.qwen_PATH || "qwen",
      ["mcp", "list"],
      {
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

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
      } else {
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
  } catch (error: any) {
    console.error("Error listing MCP servers via CLI:", error);
    res
      .status(500)
      .json({ error: "Failed to list MCP servers", details: error?.message });
  }
});

// POST /api/mcp/cli/add - Add MCP server using qwen cli
router.post("/cli/add", async (req, res) => {
  try {
    const {
      name,
      type = "stdio",
      command,
      args = [],
      url,
      headers = {},
      env = {},
      scope = "user",
      projectPath,
    } = req.body;

    console.log(`➕ Adding MCP server using qwen cli (${scope} scope):`, name);

    if (scope === "local" && projectPath) {
      console.log("📁 Running in project directory:", projectPath);
    }
    const configPath =
      scope == "user"
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
      } else {
        return res.status(200).json({
          success: true,
          message: `Server "${name}" added successfully`,
        });
      }
    } else if (type === "sse") {
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
      } else {
        return res.status(200).json({
          success: true,
          message: `Server "${name}" added successfully`,
        });
      }
    } else {
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
      } else {
        return res.status(200).json({
          success: true,
          message: `Server "${name}" added successfully`,
        });
      }
    }

    // For local scope, we need to run the command in the project directory
  } catch (error: any) {
    console.error("Error adding MCP server via CLI:", error);
    res
      .status(500)
      .json({ error: "Failed to add MCP server", details: error?.message });
  }
});

// POST /api/mcp/cli/add-json - Add MCP server using JSON format
router.post("/cli/add-json", async (req, res) => {
  try {
    const { name, jsonConfig, scope = "user", projectPath } = req.body;

    console.log("➕ Adding MCP server using JSON format:", name);

    // Validate and parse JSON config
    let parsedConfig;
    try {
      parsedConfig =
        typeof jsonConfig === "string" ? JSON.parse(jsonConfig) : jsonConfig;
    } catch (parseError: any) {
      return res.status(400).json({
        error: "Invalid JSON configuration",
        details: parseError?.message,
      });
    }

    // Validate required fields
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

    if (
      (parsedConfig.type === "http" || parsedConfig.type === "sse") &&
      !parsedConfig.url
    ) {
      return res.status(400).json({
        error: "Invalid configuration",
        details: `${parsedConfig.type} type requires a url field`,
      });
    }

    const { spawn } = await import("child_process");

    // Build the command: qwen mcp add-json --scope <scope> <name> '<json>'
    const cliArgs = ["mcp", "add-json", "--scope", scope, name];

    // Add the JSON config as a properly formatted string
    const jsonString = JSON.stringify(parsedConfig);
    cliArgs.push(jsonString);

    console.log(
      "🔧 Running qwen cli command:",
      //@ts-ignore
      process.env.qwen_PATH || "qwen",
      cliArgs[0],
      cliArgs[1],
      cliArgs[2],
      cliArgs[3],
      cliArgs[4],
      jsonString
    );

    // For local scope, we need to run the command in the project directory
    const spawnOptions: SpawnOptions = {
      stdio: ["pipe", "pipe", "pipe"],
    } satisfies SpawnOptions;

    if (scope === "local" && projectPath) {
      spawnOptions.cwd = projectPath;
      console.log("📁 Running in project directory:", projectPath);
    }

    const process2 = spawn(
      //@ts-ignore
      process.env.qwen_PATH || "qwen",
      cliArgs,
      spawnOptions
    );

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
      } else {
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
  } catch (error: any) {
    console.error("Error adding MCP server via JSON:", error);
    res
      .status(500)
      .json({ error: "Failed to add MCP server", details: error?.message });
  }
});

// DELETE /api/mcp/cli/remove/:name - Remove MCP server using qwen cli
router.delete("/cli/remove/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { scope, projectPath } = req.query; // Get scope from query params

    // Handle the ID format (remove scope prefix if present)
    let actualName: string | undefined = name;
    let actualScope = scope;

    // If the name includes a scope prefix like "local:test", extract it
    if (name.includes(":")) {
      const [prefix, serverName] = name.split(":");
      actualName = serverName;
      actualScope = actualScope || prefix; // Use prefix as scope if not provided in query
    }

    console.log(
      "🗑️ Removing MCP server using qwen cli:",
      actualName,
      "scope:",
      actualScope
    );

    // Add scope flag if it's local scope
    if (actualScope === "local") {
      console.log("📁 Running in project directory:", projectPath);
    }
    if (actualName) {
      const configPath =
        actualScope == "user"
          ? path.join(os.homedir(), ".qwen", "settings.json")
          : //@ts-ignore
            path.join(projectPath, ".qwen", "settings.json");
      const mcm = new MCPConfigManager(configPath);

      const result = await mcm.removeServer(actualName);

      if (result.success) {
        res.json({
          success: true,

          message: `MCP server "${actualName}" removed successfully via JSON`,
        });
      } else {
        res.status(404).json({
          success: false,
          message:
            `MCP server "${actualName}" not found` +
            "\n" +
            "error:" +
            result.error,
        });
      }
    }
  } catch (error: any) {
    console.error("Error removing MCP server via CLI:", error);
    res
      .status(500)
      .json({ error: "Failed to remove MCP server", details: error?.message });
  }
});

// GET /api/mcp/cli/get/:name - Get MCP server details using qwen cli
router.get("/cli/get/:name", async (req, res) => {
  try {
    const { name } = req.params;

    console.log("📄 Getting MCP server details using qwen cli:", name);

    const { spawn } = await import("child_process");

    const process2 = spawn(
      //@ts-ignore
      process.env.qwen_PATH || "qwen",
      ["mcp", "get", name],
      {
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

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
      } else {
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
  } catch (error: any) {
    console.error("Error getting MCP server details via CLI:", error);
    res.status(500).json({
      error: "Failed to get MCP server details",
      details: error?.message,
    });
  }
});

// Type definitions for qwen configuration
export interface qwenServerConfig {
  type?: "stdio" | "http" | "sse";
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  httpUrl?: string;
  transport?: "stdio" | "http" | "sse";
  headers?: Record<string, string>;
}

export interface qwenProjectConfig {
  mcpServers?: Record<string, qwenServerConfig>;
}

export interface qwenConfigData {
  mcpServers?: Record<string, qwenServerConfig>;
  projects?: Record<string, qwenProjectConfig>;
}

export interface MCPServerResponse {
  id: string;
  name: string;
  type: string;
  scope: "user" | "local";
  config: {
    httpUrl?: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    headers?: Record<string, string>;
  };
  raw: qwenServerConfig;
  projectPath?: string;
}

export interface ConfigReadResponse {
  success?: boolean;
  message?: string;
  configPath?: string | null;
  servers?: MCPServerResponse[];
  error?: string;
  details?: string;
}

// GET /api/mcp/config/read - Read MCP servers directly from qwen config files
router.get(
  "/config/read",
  async (req: express.Request, res: express.Response<ConfigReadResponse>) => {
    try {
      console.log("📖 Reading MCP servers from qwen config files");

      const homeDir = os.homedir();
      const configPaths = [
        path.join(homeDir, ".qwen/settings.json"),
        path.join(homeDir, ".qwen", "settings.json"),
      ];

      let configData: qwenConfigData | null = null;
      let configPath: string | null = null;

      // Try to read from either config file
      for (const filepath of configPaths) {
        try {
          const fileContent = await fs.readFile(filepath, "utf8");
          configData = JSON.parse(fileContent) as qwenConfigData;
          configPath = filepath;
          console.log(`✅ Found qwen config at: ${filepath}`);
          break;
        } catch (error) {
          // File doesn't exist or is not valid JSON, try next
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

      // Extract MCP servers from the config
      const servers: MCPServerResponse[] = [];

      // Check for user-scoped MCP servers (at root level)
      if (
        configData.mcpServers &&
        typeof configData.mcpServers === "object" &&
        Object.keys(configData.mcpServers).length > 0
      ) {
        console.log(
          "🔍 Found user-scoped MCP servers:",
          Object.keys(configData.mcpServers)
        );
        for (const [name, config] of Object.entries(configData.mcpServers)) {
          const server: MCPServerResponse = {
            id: name,
            name: name,
            type: "stdio", // Default type
            scope: "user", // User scope - available across all projects
            config: {},
            raw: config,
          };

          // Determine transport type and extract config
          if (
            config.command ||
            config.type == "stdio" ||
            config.transport == "stdio"
          ) {
            server.type = "stdio";
            server.config.command = config.command;
            server.config.args = config.args || [];
            server.config.env = config.env || {};
          } else if (
            config.httpUrl ||
            config.type == "http" ||
            config.transport == "http"
          ) {
            server.type = config.transport || "http";
            server.config.httpUrl = config.httpUrl;
            server.config.url = config.url;
            server.config.headers = config.headers || {};
          } else if (
            config.url ||
            config.type == "sse" ||
            config.transport == "sse"
          ) {
            server.type = config.transport || "sse";
            server.config.url = config.url;
            server.config.headers = config.headers || {};
          }

          servers.push(server);
        }
      }

      // Check for local-scoped MCP servers (project-specific)
      const currentProjectPath = process.cwd();

      // Check under 'projects' key
      if (configData.projects && configData.projects[currentProjectPath]) {
        const projectConfig = configData.projects[currentProjectPath];
        if (
          projectConfig.mcpServers &&
          typeof projectConfig.mcpServers === "object" &&
          Object.keys(projectConfig.mcpServers).length > 0
        ) {
          console.log(
            `🔍 Found local-scoped MCP servers for ${currentProjectPath}:`,
            Object.keys(projectConfig.mcpServers)
          );
          for (const [name, config] of Object.entries(
            projectConfig.mcpServers
          )) {
            const server: MCPServerResponse = {
              id: `local:${name}`, // Prefix with scope for uniqueness
              name: name, // Keep original name
              type: "stdio", // Default type
              scope: "local", // Local scope - only for this project
              projectPath: currentProjectPath,
              config: {},
              raw: config,
            };

            // Determine transport type and extract config
            if (config.command) {
              server.type = "stdio";
              server.config.command = config.command;
              server.config.args = config.args || [];
              server.config.env = config.env || {};
            } else if (config.url) {
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
    } catch (error: any) {
      console.error("Error reading qwen config:", error);
      res.status(500).json({
        error: "Failed to read qwen configuration",
        details: error?.message,
      });
    }
  }
);

// Helper functions to parse qwen cli output
export interface qwenListServer {
  name: string;
  type: string;
  status: string;
  description?: string;
}

function parseqwenListOutput(output: string): qwenListServer[] {
  const servers: qwenListServer[] = [];
  const lines = output.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    // Skip the header line
    if (line.includes("Checking MCP server health")) continue;

    // Parse lines like "test: test test - ✗ Failed to connect"
    // or "server-name: command or description - ✓ Connected"
    if (line.includes(":")) {
      const colonIndex = line.indexOf(":");
      const name = line.substring(0, colonIndex).trim();

      // Skip empty names
      if (!name) continue;

      // Extract the rest after the name
      const rest = line.substring(colonIndex + 1).trim();

      // Try to extract description and status
      let description: string | undefined = rest;
      let status: string | undefined = "unknown";
      let type = "stdio"; // default type

      // Check for status indicators
      if (rest.includes("✓") || rest.includes("✗")) {
        const statusMatch = rest.match(/(.*?)\s*-\s*([✓✗].*)$/);
        if (statusMatch) {
          description = statusMatch[1]?.trim();
          status = statusMatch[2]?.includes("✓") ? "connected" : "failed";
        }
      }

      // Try to determine type from description
      if (
        description?.startsWith("http://") ||
        description?.startsWith("https://")
      ) {
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
export interface qwenGetOutput {
  name?: string;
  type?: string;
  command?: string | undefined;
  url?: string | undefined;
  raw_output?: string;
  parse_error?: string;
  [key: string]: any; // Allow additional properties
}

function parseqwenGetOutput(output: string): qwenGetOutput {
  // Parse the output from 'qwen mcp get <name>' command
  // This is a simple parser - might need adjustment based on actual output format
  try {
    // Try to extract JSON if present
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Otherwise, parse as text
    const server: qwenGetOutput = { raw_output: output };
    const lines = output.split("\n");

    for (const line of lines) {
      if (line.includes("Name:")) {
        server.name = line.split(":")[1]?.trim();
      } else if (line.includes("Type:")) {
        server.type = line.split(":")[1]?.trim();
      } else if (line.includes("Command:")) {
        server.command = line.split(":")[1]?.trim();
      } else if (line.includes("URL:")) {
        server.url = line.split(":")[1]?.trim();
      }
    }

    return server;
  } catch (error: any) {
    return { raw_output: output, parse_error: error.message };
  }
}

export default router;
