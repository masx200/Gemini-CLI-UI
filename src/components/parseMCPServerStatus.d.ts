export interface MCPTool {
    name: string;
    description: string;
    details: string[];
}
export interface MCPServer {
    status: "Ready" | "Disconnected";
    name: string;
    description: string;
    tools: MCPTool[];
}
export declare function parseMCPServerStatus(content: string): MCPServer[];
//# sourceMappingURL=parseMCPServerStatus.d.ts.map