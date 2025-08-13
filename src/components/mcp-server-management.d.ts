export interface Project {
    name: string;
    path: string;
    displayName: string;
    fullPath: string;
}
export interface MCPServerData {
    id: string;
    name: string;
    type: string;
    scope: string;
    projectPath: string;
    config: {
        command: string;
        args: never[];
        env: {};
        url: string;
        headers: {};
        timeout: number;
    };
    raw: undefined;
}
export default function McpServerManagement({ projects, setSaveStatus, }: {
    projects: Project[];
    setSaveStatus: (status: string) => void;
}): JSX.Element;
//# sourceMappingURL=mcp-server-management.d.ts.map