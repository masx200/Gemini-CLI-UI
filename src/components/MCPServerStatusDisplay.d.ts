import type { MCPServer } from "./parseMCPServerStatus.ts";
export interface MCPServerStatusDisplayProps {
    servers: MCPServer[];
    loading?: boolean;
    error?: Error;
}
export declare function MCPServerStatusDisplay({ servers, loading, error, }: MCPServerStatusDisplayProps): import("react/jsx-runtime").JSX.Element;
export interface MCPServerCardProps {
    server: MCPServer;
}
export declare function MCPServerCard({ server }: MCPServerCardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=MCPServerStatusDisplay.d.ts.map