// Utility function for authenticated API calls
export const authenticatedFetch = (
  url: RequestInfo | URL,
  options: RequestInit & { headers?: HeadersInit | undefined } = {},
) => {
  const token = localStorage.getItem("auth-token");

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};

// API endpoints
export const api = {
  // Auth endpoints (no token required)
  auth: {
    status: () => fetch("/api/auth/status"),
    login: (username: any, password: any) =>
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }),
    register: (username: any, password: any) =>
      fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }),
    user: () => authenticatedFetch("/api/auth/user"),
    logout: () => authenticatedFetch("/api/auth/logout", { method: "POST" }),
  },

  // Protected endpoints
  config: () => authenticatedFetch("/api/config"),
  projects: () => authenticatedFetch("/api/projects"),
  sessions: (projectName: any, limit = 5, offset = 0) =>
    authenticatedFetch(
      `/api/projects/${projectName}/sessions?limit=${limit}&offset=${offset}`,
    ),
  sessionMessages: (projectName: any, sessionId: any) =>
    authenticatedFetch(
      `/api/projects/${projectName}/sessions/${sessionId}/messages`,
    ),
  renameProject: (projectName: any, displayName: any) =>
    authenticatedFetch(`/api/projects/${projectName}/rename`, {
      method: "PUT",
      body: JSON.stringify({ displayName }),
    }),
  deleteSession: (projectName: any, sessionId: any) =>
    authenticatedFetch(`/api/projects/${projectName}/sessions/${sessionId}`, {
      method: "DELETE",
    }),
  deleteProject: (projectName: any) =>
    authenticatedFetch(`/api/projects/${projectName}`, {
      method: "DELETE",
    }),
  createProject: (path: any) =>
    authenticatedFetch("/api/projects/create", {
      method: "POST",
      body: JSON.stringify({ path }),
    }),
  readFile: (projectName: any, filePath: string | number | boolean) =>
    authenticatedFetch(
      `/api/projects/${projectName}/file?filePath=${
        encodeURIComponent(
          filePath,
        )
      }`,
    ),
  saveFile: (projectName: any, filePath: any, content: any) =>
    authenticatedFetch(`/api/projects/${projectName}/file`, {
      method: "PUT",
      body: JSON.stringify({ filePath, content }),
    }),
  getFiles: (projectName: any) =>
    authenticatedFetch(`/api/projects/${projectName}/files`),
  transcribe: (formData: any) =>
    authenticatedFetch("/api/transcribe", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    }),
};
