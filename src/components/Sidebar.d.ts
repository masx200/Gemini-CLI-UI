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
export interface Project {
    name: string;
    displayName: string;
    fullPath: string;
    sessions?: Session[];
    sessionMeta?: SessionMeta;
}
export interface SidebarProps {
    projects: Project[];
    selectedProject: Project | null;
    selectedSession: Session | null;
    onProjectSelect: (project: Project) => void;
    onSessionSelect: (project: Project, session: Session) => void;
    onNewSession: (project: Project) => void;
    onSessionDelete: (sessionId: string) => void;
    onProjectDelete: (projectName: string) => void;
    isLoading: boolean;
    onRefresh: () => void;
    onShowSettings: () => void;
    replaceTemporarySession: (realSessionId: string) => void;
}
declare function Sidebar({ projects, selectedProject, selectedSession, onProjectSelect, onSessionSelect, onNewSession, onSessionDelete, onProjectDelete, isLoading, onRefresh, onShowSettings, }: SidebarProps): import("react/jsx-runtime").JSX.Element;
export default Sidebar;
//# sourceMappingURL=Sidebar.d.ts.map