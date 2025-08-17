export interface MCPServerConfig {
    command?: string;
    url?: string;
    httpUrl?: string;
    args?: string[];
    headers?: Record<string, string>;
    env?: Record<string, string>;
    cwd?: string;
    timeout?: number;
    trust?: boolean;
    includeTools?: string[];
    excludeTools?: string[];
    oauth?: {
        enabled?: boolean;
        clientId?: string;
        clientSecret?: string;
        authorizationUrl?: string;
        tokenUrl?: string;
        scopes?: string[];
        redirectUri?: string;
        tokenParamName?: string;
        audiences?: string[];
    };
    authProviderType?: "dynamic_discovery" | "google_credentials";
    type: "stdio" | "sse" | "http";
}
export interface MCPServersConfig {
    [serverName: string]: MCPServerConfig;
}
export interface MCPSettings {
    mcpServers: MCPServersConfig;
}
export type MCPTransportType = "stdio" | "sse" | "http";
export interface MCPServerData {
    id: string;
    name: string;
    type: MCPTransportType;
    scope: "user" | "project";
    projectPath?: string;
    config: MCPServerConfig;
    raw?: any;
}
export interface MCPOperationResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}
//# sourceMappingURL=mcp-config.d.ts.map