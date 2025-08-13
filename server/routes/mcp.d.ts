declare const router: import("express-serve-static-core").Router;
export interface ClaudeServerConfig {
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    transport?: "stdio" | "http" | "sse";
    headers?: Record<string, string>;
}
export interface ClaudeProjectConfig {
    mcpServers?: Record<string, ClaudeServerConfig>;
}
export interface ClaudeConfigData {
    mcpServers?: Record<string, ClaudeServerConfig>;
    projects?: Record<string, ClaudeProjectConfig>;
}
export interface MCPServerResponse {
    id: string;
    name: string;
    type: string;
    scope: "user" | "local";
    config: {
        command?: string;
        args?: string[];
        env?: Record<string, string>;
        url?: string;
        headers?: Record<string, string>;
    };
    raw: ClaudeServerConfig;
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
export interface ClaudeListServer {
    name: string;
    type: string;
    status: string;
    description: string;
}
export interface ClaudeGetOutput {
    name?: string;
    type?: string;
    command?: string;
    url?: string;
    raw_output?: string;
    parse_error?: string;
    [key: string]: any;
}
export default router;
//# sourceMappingURL=mcp.d.ts.map