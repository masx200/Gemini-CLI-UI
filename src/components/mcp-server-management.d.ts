export interface Project {
  name: string;
  path: string;
  displayName: string;
  fullPath: string;
  sessions?: Session[];
  sessionMeta?: SessionMeta;
}
export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  lastActivity: string;
  messageCount?: number;
}
export interface SessionMeta {
  total: number;
  hasMore?: boolean;
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
export default function McpServerManagement({ projects, setSaveStatus }: {
  projects: Project[];
  setSaveStatus: (status: string) => void;
}): JSX.Element;
//# sourceMappingURL=mcp-server-management.d.ts.map
