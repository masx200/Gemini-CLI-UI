export declare const authenticatedFetch: (
  url: RequestInfo | URL,
  options?: RequestInit & {
    headers?: HeadersInit | undefined;
  },
) => Promise<Response>;
export declare const api: {
  auth: {
    status: () => Promise<Response>;
    login: (username: any, password: any) => Promise<Response>;
    register: (username: any, password: any) => Promise<Response>;
    user: () => Promise<Response>;
    logout: () => Promise<Response>;
  };
  config: () => Promise<Response>;
  projects: () => Promise<Response>;
  sessions: (
    projectName: any,
    limit?: number,
    offset?: number,
  ) => Promise<Response>;
  sessionMessages: (projectName: any, sessionId: any) => Promise<Response>;
  renameProject: (projectName: any, displayName: any) => Promise<Response>;
  deleteSession: (projectName: any, sessionId: any) => Promise<Response>;
  deleteProject: (projectName: any) => Promise<Response>;
  createProject: (path: any) => Promise<Response>;
  readFile: (
    projectName: any,
    filePath: string | number | boolean,
  ) => Promise<Response>;
  saveFile: (
    projectName: any,
    filePath: any,
    content: any,
  ) => Promise<Response>;
  getFiles: (projectName: any) => Promise<Response>;
  transcribe: (formData: any) => Promise<Response>;
};
//# sourceMappingURL=api.d.ts.map
