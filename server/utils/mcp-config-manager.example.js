import { addMCPServer, listMCPServers, MCPConfigManager, removeMCPServer, } from "./mcp-config-manager.js";
async function example1() {
    console.log("=== 示例1：使用MCPConfigManager类 ===");
    const manager = new MCPConfigManager();
    const pythonConfig = {
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
    const httpConfig = {
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
    const listResult = await manager.listServers();
    console.log("服务器列表:", listResult);
    const getResult = await manager.getServer("pythonTools");
    console.log("获取服务器详情:", getResult);
}
async function example2() {
    console.log("\n=== 示例2：使用便捷函数 ===");
    const customConfigPath = "./custom-gemini-settings.json";
    const nodeConfig = {
        type: "stdio",
        command: "node",
        args: ["dist/server.js", "--verbose"],
        cwd: "./mcp-servers/node",
        trust: true,
    };
    const result1 = await addMCPServer("nodeServer", nodeConfig, customConfigPath);
    console.log("添加Node服务器结果:", result1);
    const listResult = await listMCPServers(customConfigPath);
    console.log("自定义配置服务器列表:", listResult);
    const removeResult = await removeMCPServer("nodeServer", customConfigPath);
    console.log("移除结果:", removeResult);
}
async function example3() {
    console.log("\n=== 示例3：批量操作 ===");
    const manager = new MCPConfigManager();
    const servers = {
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
    const count = await manager.getServerCount();
    console.log(`当前服务器总数: ${count}`);
    const exists = await manager.serverExists("dockerServer");
    console.log(`dockerServer是否存在: ${exists}`);
}
async function example4() {
    console.log("\n=== 示例4：错误处理 ===");
    const manager = new MCPConfigManager();
    const config = {
        type: "stdio",
        command: "python",
        args: ["server.py"],
    };
    await manager.addServer("testServer", config);
    const duplicateResult = await manager.addServer("testServer", config);
    console.log("重复添加结果:", duplicateResult);
    const notFoundResult = await manager.getServer("nonexistent");
    console.log("获取不存在服务器结果:", notFoundResult);
    await manager.removeServer("testServer");
}
async function example5() {
    console.log("\n=== 示例5：OAuth配置 ===");
    const manager = new MCPConfigManager();
    const oauthConfig = {
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
async function runExamples() {
    try {
        await example1();
        await example2();
        await example3();
        await example4();
        await example5();
    }
    catch (error) {
        console.error("示例运行失败:", error);
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    runExamples();
}
//# sourceMappingURL=mcp-config-manager.example.js.map