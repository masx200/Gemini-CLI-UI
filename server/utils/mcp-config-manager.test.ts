/**
 * MCP配置管理器测试
 *
 * 运行测试：
 * node --loader ts-node/esm mcp-config-manager.test.ts
 */

import { strict as assert } from "assert";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { MCPConfigManager } from "./mcp-config-manager.js";
import type { MCPServerConfig } from "../types/mcp-config.js";

// 测试配置
const testConfigPath = path.join(os.tmpdir(), "test-gemini-settings.json");

async function cleanup() {
  try {
    await fs.unlink(testConfigPath);
  } catch {
    // 文件不存在时忽略
  }
}

async function runTests() {
  console.log("🧪 开始MCP配置管理器测试...\n");

  // 清理测试环境
  await cleanup();

  const manager = new MCPConfigManager(testConfigPath);

  try {
    // 测试1：初始状态
    console.log("测试1：初始状态");
    const initialList = await manager.listServers();
    assert.strictEqual(initialList.success, true);
    assert.strictEqual(initialList.data.length, 0);
    console.log("✅ 初始状态测试通过\n");

    // 测试2：添加服务器
    console.log("测试2：添加服务器");
    const serverConfig: MCPServerConfig = {
      type: "stdio",
      command: "python",
      args: ["-m", "test_server"],
      cwd: "./test",
      timeout: 5000,
    };

    const addResult = await manager.addServer("testServer", serverConfig);
    assert.strictEqual(addResult.success, true);
    assert.strictEqual(addResult.data.name, "testServer");
    console.log("✅ 添加服务器测试通过\n");

    // 测试3：列出服务器
    console.log("测试3：列出服务器");
    const listResult = await manager.listServers();
    assert.strictEqual(listResult.success, true);
    assert.strictEqual(listResult.data.length, 1);
    assert.strictEqual(listResult.data[0].name, "testServer");
    console.log("✅ 列出服务器测试通过\n");

    // 测试4：获取特定服务器
    console.log("测试4：获取特定服务器");
    const getResult = await manager.getServer("testServer");
    assert.strictEqual(getResult.success, true);
    assert.strictEqual(getResult.data.name, "testServer");
    assert.strictEqual(getResult.data.config.command, "python");
    console.log("✅ 获取特定服务器测试通过\n");

    // 测试5：服务器存在检查
    console.log("测试5：服务器存在检查");
    const exists = await manager.serverExists("testServer");
    assert.strictEqual(exists, true);
    const notExists = await manager.serverExists("nonexistent");
    assert.strictEqual(notExists, false);
    console.log("✅ 服务器存在检查测试通过\n");

    // 测试6：获取服务器数量
    console.log("测试6：获取服务器数量");
    const count = await manager.getServerCount();
    assert.strictEqual(count, 1);
    console.log("✅ 获取服务器数量测试通过\n");

    // 测试7：更新服务器
    console.log("测试7：更新服务器");
    const updatedConfig: MCPServerConfig = {
      type: "stdio",
      command: "node",
      args: ["server.js"],
      trust: true,
    };

    const updateResult = await manager.updateServer(
      "testServer",
      updatedConfig,
    );
    assert.strictEqual(updateResult.success, true);

    const updatedGet = await manager.getServer("testServer");
    assert.strictEqual(updatedGet.data.config.command, "node");
    assert.strictEqual(updatedGet.data.config.trust, true);
    console.log("✅ 更新服务器测试通过\n");

    // 测试8：重复添加
    console.log("测试8：重复添加");
    const duplicateResult = await manager.addServer("testServer", serverConfig);
    assert.strictEqual(duplicateResult.success, false);
    assert.strictEqual(duplicateResult.error, "DUPLICATE_NAME");
    console.log("✅ 重复添加测试通过\n");

    // 测试9：获取不存在的服务器
    console.log("测试9：获取不存在的服务器");
    const notFoundResult = await manager.getServer("nonexistent");
    assert.strictEqual(notFoundResult.success, false);
    assert.strictEqual(notFoundResult.error, "NOT_FOUND");
    console.log("✅ 获取不存在服务器测试通过\n");

    // 测试10：移除服务器
    console.log("测试10：移除服务器");
    const removeResult = await manager.removeServer("testServer");
    assert.strictEqual(removeResult.success, true);
    assert.strictEqual(removeResult.data.name, "testServer");

    const finalList = await manager.listServers();
    assert.strictEqual(finalList.data.length, 0);
    console.log("✅ 移除服务器测试通过\n");

    // 测试11：移除不存在的服务器
    console.log("测试11：移除不存在的服务器");
    const removeNotFound = await manager.removeServer("nonexistent");
    assert.strictEqual(removeNotFound.success, false);
    assert.strictEqual(removeNotFound.error, "NOT_FOUND");
    console.log("✅ 移除不存在服务器测试通过\n");

    console.log("🎉 所有测试通过！");
  } catch (error) {
    console.error("❌ 测试失败:", error);
    throw error;
  } finally {
    // 清理测试文件
    await cleanup();
  }
}

// 测试不同的传输类型
async function testTransportTypes() {
  console.log("\n🧪 测试不同传输类型...\n");

  await cleanup();
  const manager = new MCPConfigManager(testConfigPath);

  try {
    // 测试Stdio传输
    const stdioConfig: MCPServerConfig = {
      type: "stdio",
      command: "python",
      args: ["-m", "mcp_server"],
      cwd: "./servers",
      env: { "ENV_VAR": "value" },
      timeout: 30000,
    };

    await manager.addServer("stdioServer", stdioConfig);

    // 测试SSE传输
    const sseConfig: MCPServerConfig = {
      type: "sse",
      url: "http://localhost:8080/sse",
      headers: {
        "Authorization": "Bearer token",
        "X-Custom": "value",
      },
      timeout: 5000,
    };

    await manager.addServer("sseServer", sseConfig);

    // 测试HTTP传输
    const httpConfig: MCPServerConfig = {
      type: "http",
      httpUrl: "http://localhost:3000/mcp",
      headers: {
        "Content-Type": "application/json",
      },
      trust: true,
    };

    await manager.addServer("httpServer", httpConfig);

    // 测试OAuth配置
    const oauthConfig: MCPServerConfig = {
      type: "http",
      httpUrl: "https://api.example.com/mcp",
      oauth: {
        enabled: true,
        scopes: ["read", "write"],
        clientId: "test-client",
      },
      authProviderType: "google_credentials",
    };

    await manager.addServer("oauthServer", oauthConfig);

    const listResult = await manager.listServers();
    assert.strictEqual(listResult.data.length, 4);
    console.log("✅ 不同传输类型测试通过");
  } finally {
    await cleanup();
  }
}

// 运行所有测试
async function main() {
  try {
    await runTests();
    await testTransportTypes();
    console.log("\n🎉 所有测试套件通过！");
  } catch (error) {
    console.error("\n❌ 测试套件失败:", error);
    process.exit(1);
  }
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
