declare const router: import("express-serve-static-core").Router;
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
export interface qwenListServer {
    name: string;
    type: string;
    status: string;
    description?: string;
}
export interface qwenGetOutput {
    name?: string;
    type?: string;
    command?: string | undefined;
    url?: string | undefined;
    raw_output?: string;
    parse_error?: string;
    [key: string]: any;
}
export default router;
//# sourceMappingURL=mcp.d.ts.map