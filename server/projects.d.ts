declare function clearProjectDirectoryCache(): void;
declare function loadProjectConfig(): Promise<any>;
declare function saveProjectConfig(config: any): Promise<void>;
declare function extractProjectDirectory(projectName: any): Promise<any>;
declare function getProjects(): Promise<{
    name: string;
    path: any;
    displayName: any;
    fullPath: any;
    isCustomName: boolean;
    sessions: never[];
}[]>;
declare function getSessions(projectName: any, limit?: number, offset?: number): Promise<{
    sessions: never[];
    hasMore: boolean;
    total: number;
    offset?: undefined;
    limit?: undefined;
} | {
    sessions: any[];
    hasMore: boolean;
    total: number;
    offset: number;
    limit: number;
}>;
declare function parseJsonlSessions(filePath: any): Promise<any[]>;
declare function getSessionMessages(projectName: any, sessionId: any): Promise<any[]>;
declare function renameProject(projectName: any, newDisplayName: any): Promise<boolean>;
declare function deleteSession(projectName: any, sessionId: any): Promise<boolean>;
declare function isProjectEmpty(projectName: any): Promise<boolean>;
declare function deleteProject(projectName: any): Promise<boolean>;
declare function addProjectManually(projectPath: any, displayName?: null): Promise<{
    name: string;
    path: string;
    fullPath: string;
    displayName: any;
    isManuallyAdded: boolean;
    sessions: never[];
}>;
export { addProjectManually, clearProjectDirectoryCache, deleteProject, deleteSession, extractProjectDirectory, getProjects, getSessionMessages, getSessions, isProjectEmpty, loadProjectConfig, parseJsonlSessions, renameProject, saveProjectConfig, };
//# sourceMappingURL=projects.d.ts.map