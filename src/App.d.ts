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
    path: string;
    name: string;
    displayName: string;
    fullPath: string;
    sessions?: Session[];
    sessionMeta?: SessionMeta;
}
declare function App(): import("react/jsx-runtime").JSX.Element;
export default App;
//# sourceMappingURL=App.d.ts.map