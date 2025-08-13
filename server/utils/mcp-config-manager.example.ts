/**
 * MCP配置管理器使用示例
 *
 * 这个文件展示了如何使用MCPConfigManager类及其便捷函数
 * 来管理gemini-cli的MCP服务器配置
 */

import type { MCPServerConfig } from "../types/mcp-config.js";
import {
  addMCPServer,
  listMCPServers,
  MCPConfigManager,
  removeMCPServer,
} from "./mcp-config-manager.js";

// 示例1：使用MCPConfigManager类
async function example1() {
  console.log("=== 示例1：使用MCPConfigManager类 ===");

  const manager = new MCPConfigManager();

  // 添加一个Python MCP服务器
  const pythonConfig: MCPServerConfig = {
    type: "stdio",
    command: "python",
    args: ["-m", "mcp_server_example"],
    cwd: "./mcp-servers/python",
    env: {
      "DATABASE_URL": "sqlite:///example.db",
      "API_KEY": "your-api-key",
    },
    timeout: 30000,
    trust: false,
  };

  const result1 = await manager.addServer("pythonTools", pythonConfig);
  console.log("添加结果:", result1);

  // 添加一个HTTP MCP服务器
  const httpConfig: MCPServerConfig = {
    type: "http",
    httpUrl: "http://localhost:3000/mcp",
    headers: {
      "Authorization": "Bearer your-token",
      "Content-Type": "application/json",
    },
    timeout: 5000,
  };

  const result2 = await manager.addServer("httpServer", httpConfig);
  console.log("添加HTTP服务器结果:", result2);

  // 列出所有服务器
  const listResult = await manager.listServers();
  console.log("服务器列表:", listResult);

  // 获取特定服务器
  const getResult = await manager.getServer("pythonTools");
  console.log("获取服务器详情:", getResult);
}

// 示例2：使用便捷函数
async function example2() {
  console.log("\n=== 示例2：使用便捷函数 ===");

  // 使用自定义配置文件路径
  const customConfigPath = "./custom-gemini-settings.json";

  // 添加Node.js MCP服务器
  const nodeConfig: MCPServerConfig = {
    type: "stdio",
    command: "node",
    args: ["dist/server.js", "--verbose"],
    cwd: "./mcp-servers/node",
    trust: true,
  };

  const result1 = await addMCPServer(
    "nodeServer",
    nodeConfig,
    customConfigPath,
  );
  console.log("添加Node服务器结果:", result1);

  // 列出服务器
  const listResult = await listMCPServers(customConfigPath);
  console.log("自定义配置服务器列表:", listResult);

  // 移除服务器
  const removeResult = await removeMCPServer("nodeServer", customConfigPath);
  console.log("移除结果:", removeResult);
}

// 示例3：批量操作
async function example3() {
  console.log("\n=== 示例3：批量操作 ===");

  const manager = new MCPConfigManager();

  // 批量添加服务器
  const servers: Record<string, MCPServerConfig> = {
    "dockerServer": {
      type: "stdio",
      command: "docker",
      args: ["run", "-i", "--rm", "mcp-server:latest"],
      env: {
        "API_KEY": "docker-api-key",
      },
    },
    "sseServer": {
      type: "sse",
      url: "http://localhost:8080/sse",
      headers: {
        "X-API-Key": "sse-key",
      },
    },
  };

  for (const [name, config] of Object.entries(servers)) {
    const result = await manager.addServer(name, config);
    console.log(`添加 ${name}:`, result.success ? "成功" : "失败");
  }

  // 显示总数
  const count = await manager.getServerCount();
  console.log(`当前服务器总数: ${count}`);

  // 检查服务器是否存在
  const exists = await manager.serverExists("dockerServer");
  console.log(`dockerServer是否存在: ${exists}`);
}

// 示例4：错误处理
async function example4() {
  console.log("\n=== 示例4：错误处理 ===");

  const manager = new MCPConfigManager();

  // 尝试添加重复的服务器
  const config: MCPServerConfig = {
    type: "stdio",
    command: "python",
    args: ["server.py"],
  };

  await manager.addServer("testServer", config);

  // 再次添加同名服务器
  const duplicateResult = await manager.addServer("testServer", config);
  console.log("重复添加结果:", duplicateResult);

  // 尝试获取不存在的服务器
  const notFoundResult = await manager.getServer("nonexistent");
  console.log("获取不存在服务器结果:", notFoundResult);

  // 清理测试数据
  await manager.removeServer("testServer");
}

// 示例5：OAuth配置
async function example5() {
  console.log("\n=== 示例5：OAuth配置 ===");

  const manager = new MCPConfigManager();

  // 添加带OAuth的服务器
  const oauthConfig: MCPServerConfig = {
    type: "http",
    httpUrl: "https://api.example.com/mcp",
    oauth: {
      enabled: true,
      scopes: ["read", "write"],
      clientId: "your-client-id",
    },
    authProviderType: "dynamic_discovery",
  };

  const result = await manager.addServer("oauthServer", oauthConfig);
  console.log("添加OAuth服务器结果:", result);
}

// 运行示例
async function runExamples() {
  try {
    await example1();
    await example2();
    await example3();
    await example4();
    await example5();
  } catch (error) {
    console.error("示例运行失败:", error);
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

/**
 * 使用提示：
 *
 * 1. 基本使用：
 *    const manager = new MCPConfigManager();
 *    await manager.addServer('serverName', config);
 *
 * 2. 使用便捷函数：
 *    await addMCPServer('serverName', config);
 *
 * 3. 自定义配置文件路径：
 *    const manager = new MCPConfigManager('/path/to/settings.json');
 *
 * 4. 配置文件位置：
 *    - 默认：~/.gemini/settings.json
 *    - 项目级：./.gemini/settings.json
 */
