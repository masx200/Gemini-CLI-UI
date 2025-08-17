declare const router: import("express-serve-static-core").Router;
export interface geminiServerConfig {
    type?: "stdio" | "http" | "sse";
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    httpUrl?: string;
    transport?: "stdio" | "http" | "sse";
    headers?: Record<string, string>;
}
export interface geminiProjectConfig {
    mcpServers?: Record<string, geminiServerConfig>;
}
export interface geminiConfigData {
    mcpServers?: Record<string, geminiServerConfig>;
    projects?: Record<string, geminiProjectConfig>;
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
    raw: geminiServerConfig;
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
export interface geminiListServer {
    name: string;
    type: string;
    status: string;
    description?: string;
}
export interface geminiGetOutput {
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