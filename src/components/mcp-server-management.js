import { Globe, Plus, Server, Terminal, X, Zap } from "lucide-react";
import {
  Fragment as _Fragment,
  jsx as _jsx,
  jsxs as _jsxs,
} from "react/jsx-runtime";
//@ts-ignore
import { Edit3, FolderOpen, Trash2 } from "lucide-react";
import { Input } from "./ui/input.jsx";
//@ts-ignore
import { Badge } from "./ui/badge.jsx";
//@ts-ignore
import { useState } from "react";
import { Button } from "./ui/button.jsx";
export default function McpServerManagement({ projects = [], setSaveStatus }) {
  const testMcpServer = async (serverId, scope = "user") => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(
        `/api/mcp/servers/${serverId}/test?scope=${scope}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        return data.testResult;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to test server");
      }
    } catch (error) {
      console.error("Error testing MCP server:", error);
      throw error;
    }
  };
  //@ts-ignore
  const handleMcpTest = async (serverId, scope) => {
    try {
      setMcpTestResults({ ...mcpTestResults, [serverId]: { loading: true } });
      const result = await testMcpServer(serverId, scope);
      setMcpTestResults({ ...mcpTestResults, [serverId]: result });
    } catch (error) {
      setMcpTestResults({
        ...mcpTestResults,
        [serverId]: {
          success: false,
          message: error.message,
          details: [],
        },
      });
    }
  };
  const [mcpTestResults, setMcpTestResults] = useState({});
  // MCP API functions
  const fetchMcpServers = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      // Try to read directly from config files for complete details
      const configResponse = await fetch("/api/mcp/config/read", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (configResponse.ok) {
        const configData = await configResponse.json();
        if (configData.success && configData.servers) {
          setMcpServers(configData.servers);
          return;
        }
      }
      // Fallback to gemini cli
      const cliResponse = await fetch("/api/mcp/cli/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (cliResponse.ok) {
        const cliData = await cliResponse.json();
        if (cliData.success && cliData.servers) {
          // Convert CLI format to our format
          const servers = cliData.servers.map((server) => ({
            id: server.name,
            name: server.name,
            type: server.type,
            scope: "user",
            config: {
              command: server.command || "",
              args: server.args || [],
              env: server.env || {},
              url: server.url || "",
              headers: server.headers || {},
              timeout: 30000,
            },
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          }));
          setMcpServers(servers);
          return;
        }
      }
      // Final fallback to direct config reading
      const response = await fetch("/api/mcp/servers?scope=user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMcpServers(data.servers || []);
      } else {
        console.error("Failed to fetch MCP servers");
      }
    } catch (error) {
      console.error("Error fetching MCP servers:", error);
    }
  };
  const deleteMcpServer = async (serverId, scope = "user") => {
    try {
      const token = localStorage.getItem("auth-token");
      // Use gemini cli to remove the server with proper scope
      const response = await fetch(
        `/api/mcp/cli/remove/${serverId}?scope=${scope}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await fetchMcpServers(); // Refresh the list
          return true;
        } else {
          throw new Error(
            result.error || "Failed to delete server via gemini cli",
          );
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete server");
      }
    } catch (error) {
      console.error("Error deleting MCP server:", error);
      throw error;
    }
  };
  const saveMcpServer = async (serverData) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (editingMcpServer) {
        // For editing, remove old server and add new one
        await deleteMcpServer(editingMcpServer.id, "user");
      }
      // Use gemini cli to add the server
      const response = await fetch("/api/mcp/cli/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: serverData.name,
          type: serverData.type,
          scope: serverData.scope,
          projectPath: serverData.projectPath,
          command: serverData.config?.command,
          args: serverData.config?.args || [],
          url: serverData.config?.url,
          headers: serverData.config?.headers || {},
          env: serverData.config?.env || {},
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await fetchMcpServers(); // Refresh the list
          return true;
        } else {
          throw new Error(
            result.error || "Failed to save server via gemini cli",
          );
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to save server");
      }
    } catch (error) {
      console.error("Error saving MCP server:", error);
      throw error;
    }
  };
  const handleMcpDelete = async (serverId, scope) => {
    if (confirm("Are you sure you want to delete this MCP server?")) {
      try {
        await deleteMcpServer(serverId, scope);
        setSaveStatus("success");
      } catch (error) {
        alert(`Error: ${error.message}`);
        setSaveStatus("error");
      }
    }
  };
  const [mcpServerTools, setMcpServerTools] = useState({});
  const [mcpToolsLoading, setMcpToolsLoading] = useState({});
  const discoverMcpTools = async (serverId, scope = "user") => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(
        `/api/mcp/servers/${serverId}/tools?scope=${scope}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        return data.toolsResult;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to discover tools");
      }
    } catch (error) {
      console.error("Error discovering MCP tools:", error);
      throw error;
    }
  };
  //@ts-ignore
  const handleMcpToolsDiscovery = async (serverId, scope) => {
    try {
      setMcpToolsLoading({ ...mcpToolsLoading, [serverId]: true });
      const result = await discoverMcpTools(serverId, scope);
      setMcpServerTools({ ...mcpServerTools, [serverId]: result });
    } catch (error) {
      setMcpServerTools({
        ...mcpServerTools,
        [serverId]: {
          success: false,
          tools: [],
          resources: [],
          prompts: [],
        },
      });
    } finally {
      setMcpToolsLoading({ ...mcpToolsLoading, [serverId]: false });
    }
  };
  const handleMcpSubmit = async (e) => {
    e.preventDefault();
    setMcpLoading(true);
    try {
      if (mcpFormData.importMode === "json") {
        // Use JSON import endpoint
        const token = localStorage.getItem("auth-token");
        const response = await fetch("/api/mcp/cli/add-json", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: mcpFormData.name,
            jsonConfig: mcpFormData.jsonInput,
            scope: mcpFormData.scope,
            projectPath: mcpFormData.projectPath,
          }),
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            await fetchMcpServers(); // Refresh the list
            resetMcpForm();
            setSaveStatus("success");
          } else {
            throw new Error(result.error || "Failed to add server via JSON");
          }
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to add server");
        }
      } else {
        // Use regular form-based save
        await saveMcpServer(mcpFormData);
        resetMcpForm();
        setSaveStatus("success");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      setSaveStatus("error");
    } finally {
      setMcpLoading(false);
    }
  };
  const updateMcpConfig = (key, value) => {
    setMcpFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };
  const [mcpLoading, setMcpLoading] = useState(false);
  const getTransportIcon = (type) => {
    switch (type) {
      case "stdio":
        return _jsx(Terminal, { className: "w-4 h-4" });
      case "sse":
        return _jsx(Zap, { className: "w-4 h-4" });
      case "http":
        return _jsx(Globe, { className: "w-4 h-4" });
      default:
        return _jsx(Server, { className: "w-4 h-4" });
    }
  };
  const [jsonValidationError, setJsonValidationError] = useState("");
  const resetMcpForm = () => {
    setMcpFormData({
      raw: undefined,
      name: "",
      type: "stdio",
      scope: "user", // Default to user scope
      projectPath: "",
      config: {
        command: "",
        args: [],
        env: {},
        url: "",
        headers: {},
        timeout: 30000,
      },
      jsonInput: "",
      importMode: "form",
    });
    setEditingMcpServer(null);
    setShowMcpForm(false);
    setJsonValidationError("");
  };
  const [mcpFormData, setMcpFormData] = useState({
    raw: undefined,
    name: "",
    type: "stdio",
    scope: "user",
    projectPath: "", // For local scope
    config: {
      command: "",
      args: [],
      env: {},
      url: "",
      headers: {},
      timeout: 30000,
    },
    jsonInput: "", // For JSON import
    importMode: "form", // 'form' or 'json'
  });
  const [showMcpForm, setShowMcpForm] = useState(false);
  const [editingMcpServer, setEditingMcpServer] = useState(null);
  const openMcpForm = (server = null) => {
    if (server) {
      setEditingMcpServer(server);
      setMcpFormData({
        name: server.name,
        type: server.type,
        scope: server.scope,
        projectPath: server.projectPath || "",
        config: { ...server.config },
        raw: server.raw, // Store raw config for display
        importMode: "form", // Always use form mode when editing
        jsonInput: "",
      });
    } else {
      resetMcpForm();
    }
    setShowMcpForm(true);
  };
  const [mcpServers, setMcpServers] = useState([]);
  return _jsxs(_Fragment, {
    children: [
      _jsxs("div", {
        className: "space-y-4",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              _jsx(Server, { className: "w-5 h-5 text-purple-500" }),
              _jsx("h3", {
                className: "text-lg font-medium text-foreground",
                children: "MCP Servers",
              }),
            ],
          }),
          _jsx("div", {
            className: "space-y-2",
            children: _jsx("p", {
              className: "text-sm text-muted-foreground",
              children:
                "Model Context Protocol servers provide additional tools and data sources to gemini",
            }),
          }),
          _jsx("div", {
            className: "flex justify-between items-center",
            children: _jsxs(Button, {
              onClick: () => openMcpForm(),
              className: "bg-purple-600 hover:bg-purple-700 text-white",
              size: "sm",
              children: [
                _jsx(Plus, { className: "w-4 h-4 mr-2" }),
                "Add MCP Server",
              ],
            }),
          }),
          _jsxs("div", {
            className: "space-y-2",
            children: [
              mcpServers.map((server) =>
                _jsx(
                  "div",
                  {
                    className:
                      "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4",
                    children: _jsxs("div", {
                      className: "flex items-start justify-between",
                      children: [
                        _jsxs("div", {
                          className: "flex-1",
                          children: [
                            _jsxs("div", {
                              className: "flex items-center gap-2 mb-2",
                              children: [
                                getTransportIcon(server.type),
                                _jsx("span", {
                                  className: "font-medium text-foreground",
                                  children: server.name,
                                }),
                                _jsx(Badge, {
                                  variant: "outline",
                                  className: "text-xs",
                                  children: server.type,
                                }),
                                _jsx(Badge, {
                                  variant: "outline",
                                  className: "text-xs",
                                  children: server.scope === "local"
                                    ? "📁 local"
                                    : server.scope === "user"
                                    ? "👤 user"
                                    : server.scope,
                                }),
                                server.projectPath &&
                                _jsx(Badge, {
                                  variant: "outline",
                                  className:
                                    "text-xs bg-purple-50 dark:bg-purple-900/20",
                                  title: server.projectPath,
                                  children: server.projectPath
                                    .split("/")
                                    .pop(),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className:
                                "text-sm text-muted-foreground space-y-1",
                              children: [
                                server.type === "stdio" &&
                                server.config.command &&
                                _jsxs("div", {
                                  children: [
                                    "Command:",
                                    " ",
                                    _jsx("code", {
                                      className:
                                        "bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs",
                                      children: server.config.command,
                                    }),
                                  ],
                                }),
                                (server.type === "sse" ||
                                  server.type === "http") &&
                                server.config.url &&
                                _jsxs("div", {
                                  children: [
                                    "URL:",
                                    " ",
                                    _jsx("code", {
                                      className:
                                        "bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs",
                                      children: server.config.url,
                                    }),
                                  ],
                                }),
                                server.config.args &&
                                server.config.args.length > 0 &&
                                _jsxs("div", {
                                  children: [
                                    "Args:",
                                    " ",
                                    _jsx("code", {
                                      className:
                                        "bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs",
                                      children: server.config.args.join(" "),
                                    }),
                                  ],
                                }),
                                server.config.env &&
                                Object.keys(server.config.env).length > 0 &&
                                _jsxs("div", {
                                  children: [
                                    "Environment:",
                                    " ",
                                    _jsx("code", {
                                      className:
                                        "bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs",
                                      children: Object.entries(
                                        server.config.env,
                                      )
                                        .map(([k, v]) => `${k}=${v}`)
                                        .join(", "),
                                    }),
                                  ],
                                }),
                                server.raw &&
                                _jsxs("details", {
                                  className: "mt-2",
                                  children: [
                                    _jsx("summary", {
                                      className:
                                        "cursor-pointer text-xs text-muted-foreground hover:text-foreground",
                                      children: "View full config",
                                    }),
                                    _jsx("pre", {
                                      className:
                                        "mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto",
                                      children: JSON.stringify(
                                        server.raw,
                                        null,
                                        2,
                                      ),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            mcpTestResults[server.id] &&
                            _jsxs("div", {
                              className: `mt-2 p-2 rounded text-xs ${
                                mcpTestResults[server.id].success
                                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                                  : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                              }`,
                              children: [
                                _jsx("div", {
                                  className: "font-medium",
                                  children: mcpTestResults[server.id].message,
                                }),
                                mcpTestResults[server.id].details &&
                                mcpTestResults[server.id].details.length >
                                  0 &&
                                _jsx("ul", {
                                  className: "mt-1 space-y-0.5",
                                  children: mcpTestResults[
                                    server.id
                                  ].details.map((detail, i) =>
                                    _jsxs(
                                      "li",
                                      { children: ["\u2022 ", detail] },
                                      i,
                                    )
                                  ),
                                }),
                              ],
                            }),
                            mcpServerTools[server.id] &&
                            _jsxs("div", {
                              className:
                                "mt-2 p-2 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800",
                              children: [
                                _jsx("div", {
                                  className: "font-medium mb-2",
                                  children: "Available Tools & Resources",
                                }),
                                mcpServerTools[server.id].tools &&
                                mcpServerTools[server.id].tools.length >
                                  0 &&
                                _jsxs("div", {
                                  className: "mb-2",
                                  children: [
                                    _jsxs("div", {
                                      className: "font-medium text-xs mb-1",
                                      children: [
                                        "Tools (",
                                        mcpServerTools[server.id].tools
                                          .length,
                                        "):",
                                      ],
                                    }),
                                    _jsx("ul", {
                                      className: "space-y-0.5",
                                      children: mcpServerTools[
                                        server.id
                                      ].tools.map((tool, i) =>
                                        _jsxs(
                                          "li",
                                          {
                                            className: "flex items-start gap-1",
                                            children: [
                                              _jsx("span", {
                                                className:
                                                  "text-blue-400 mt-0.5",
                                                children: "\u2022",
                                              }),
                                              _jsxs("div", {
                                                children: [
                                                  _jsx("code", {
                                                    className:
                                                      "bg-blue-100 dark:bg-blue-800 px-1 rounded",
                                                    children: tool.name,
                                                  }),
                                                  tool.description &&
                                                  tool.description !==
                                                    "No description provided" &&
                                                  _jsxs("span", {
                                                    className:
                                                      "ml-1 text-xs opacity-75",
                                                    children: [
                                                      "- ",
                                                      tool.description,
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            ],
                                          },
                                          i,
                                        )
                                      ),
                                    }),
                                  ],
                                }),
                                mcpServerTools[server.id].resources &&
                                mcpServerTools[server.id].resources.length >
                                  0 &&
                                _jsxs("div", {
                                  className: "mb-2",
                                  children: [
                                    _jsxs("div", {
                                      className: "font-medium text-xs mb-1",
                                      children: [
                                        "Resources (",
                                        mcpServerTools[server.id].resources
                                          .length,
                                        "):",
                                      ],
                                    }),
                                    _jsx("ul", {
                                      className: "space-y-0.5",
                                      children: mcpServerTools[
                                        server.id
                                      ].resources.map((resource, i) =>
                                        _jsxs(
                                          "li",
                                          {
                                            className: "flex items-start gap-1",
                                            children: [
                                              _jsx("span", {
                                                className:
                                                  "text-blue-400 mt-0.5",
                                                children: "\u2022",
                                              }),
                                              _jsxs("div", {
                                                children: [
                                                  _jsx("code", {
                                                    className:
                                                      "bg-blue-100 dark:bg-blue-800 px-1 rounded",
                                                    children: resource.name,
                                                  }),
                                                  resource.description &&
                                                  resource.description !==
                                                    "No description provided" &&
                                                  _jsxs("span", {
                                                    className:
                                                      "ml-1 text-xs opacity-75",
                                                    children: [
                                                      "- ",
                                                      resource.description,
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            ],
                                          },
                                          i,
                                        )
                                      ),
                                    }),
                                  ],
                                }),
                                mcpServerTools[server.id].prompts &&
                                mcpServerTools[server.id].prompts.length >
                                  0 &&
                                _jsxs("div", {
                                  children: [
                                    _jsxs("div", {
                                      className: "font-medium text-xs mb-1",
                                      children: [
                                        "Prompts (",
                                        mcpServerTools[server.id].prompts
                                          .length,
                                        "):",
                                      ],
                                    }),
                                    _jsx("ul", {
                                      className: "space-y-0.5",
                                      children: mcpServerTools[
                                        server.id
                                      ].prompts.map((prompt, i) =>
                                        _jsxs(
                                          "li",
                                          {
                                            className: "flex items-start gap-1",
                                            children: [
                                              _jsx("span", {
                                                className:
                                                  "text-blue-400 mt-0.5",
                                                children: "\u2022",
                                              }),
                                              _jsxs("div", {
                                                children: [
                                                  _jsx("code", {
                                                    className:
                                                      "bg-blue-100 dark:bg-blue-800 px-1 rounded",
                                                    children: prompt.name,
                                                  }),
                                                  prompt.description &&
                                                  prompt.description !==
                                                    "No description provided" &&
                                                  _jsxs("span", {
                                                    className:
                                                      "ml-1 text-xs opacity-75",
                                                    children: [
                                                      "- ",
                                                      prompt.description,
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            ],
                                          },
                                          i,
                                        )
                                      ),
                                    }),
                                  ],
                                }),
                                (!mcpServerTools[server.id].tools ||
                                  mcpServerTools[server.id].tools.length ===
                                    0) &&
                                (!mcpServerTools[server.id].resources ||
                                  mcpServerTools[server.id].resources
                                      .length === 0) &&
                                (!mcpServerTools[server.id].prompts ||
                                  mcpServerTools[server.id].prompts
                                      .length === 0) &&
                                _jsx("div", {
                                  className: "text-xs opacity-75",
                                  children:
                                    "No tools, resources, or prompts discovered",
                                }),
                              ],
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "flex items-center gap-2 ml-4",
                          children: [
                            _jsx(Button, {
                              onClick: () => openMcpForm(server),
                              variant: "ghost",
                              size: "sm",
                              className:
                                "text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                              title: "Edit server",
                              children: _jsx(Edit3, { className: "w-4 h-4" }),
                            }),
                            _jsx(Button, {
                              onClick: () =>
                                handleMcpDelete(server.id, server.scope),
                              variant: "ghost",
                              size: "sm",
                              className:
                                "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
                              title: "Delete server",
                              children: _jsx(Trash2, { className: "w-4 h-4" }),
                            }),
                          ],
                        }),
                      ],
                    }),
                  },
                  server.id,
                )
              ),
              mcpServers.length === 0 &&
              _jsx("div", {
                className: "text-center py-8 text-gray-500 dark:text-gray-400",
                children: "No MCP servers configured",
              }),
            ],
          }),
        ],
      }),
      showMcpForm &&
      _jsx("div", {
        className:
          "fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4",
        children: _jsxs("div", {
          className:
            "bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto",
          children: [
            _jsxs("div", {
              className:
                "flex items-center justify-between p-4 border-b border-border",
              children: [
                _jsx("h3", {
                  className: "text-lg font-medium text-foreground",
                  children: editingMcpServer
                    ? "Edit MCP Server"
                    : "Add MCP Server",
                }),
                _jsx(Button, {
                  variant: "ghost",
                  size: "sm",
                  onClick: resetMcpForm,
                  children: _jsx(X, { className: "w-4 h-4" }),
                }),
              ],
            }),
            _jsxs("form", {
              onSubmit: handleMcpSubmit,
              className: "p-4 space-y-4",
              children: [
                !editingMcpServer &&
                _jsxs("div", {
                  className: "flex gap-2 mb-4",
                  children: [
                    _jsx("button", {
                      type: "button",
                      onClick: () =>
                        setMcpFormData((prev) => ({
                          ...prev,
                          importMode: "form",
                        })),
                      className:
                        `px-4 py-2 rounded-lg font-medium transition-colors ${
                          mcpFormData.importMode === "form"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`,
                      children: "Form Input",
                    }),
                    _jsx("button", {
                      type: "button",
                      onClick: () =>
                        setMcpFormData((prev) => ({
                          ...prev,
                          importMode: "json",
                        })),
                      className:
                        `px-4 py-2 rounded-lg font-medium transition-colors ${
                          mcpFormData.importMode === "json"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`,
                      children: "JSON Import",
                    }),
                  ],
                }),
                mcpFormData.importMode === "form" &&
                editingMcpServer &&
                _jsxs("div", {
                  className:
                    "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3",
                  children: [
                    _jsx("label", {
                      className:
                        "block text-sm font-medium text-foreground mb-2",
                      children: "Scope",
                    }),
                    _jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        mcpFormData.scope === "user"
                          ? _jsx(Globe, { className: "w-4 h-4" })
                          : _jsx(FolderOpen, { className: "w-4 h-4" }),
                        _jsx("span", {
                          className: "text-sm",
                          children: mcpFormData.scope === "user"
                            ? "User (Global)"
                            : "Project (Local)",
                        }),
                        mcpFormData.scope === "local" &&
                        mcpFormData.projectPath &&
                        _jsxs("span", {
                          className: "text-xs text-muted-foreground",
                          children: ["- ", mcpFormData.projectPath],
                        }),
                      ],
                    }),
                    _jsx("p", {
                      className: "text-xs text-muted-foreground mt-2",
                      children:
                        "Scope cannot be changed when editing an existing server",
                    }),
                  ],
                }),
                mcpFormData.importMode === "form" &&
                !editingMcpServer &&
                _jsxs("div", {
                  className: "space-y-4",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className:
                            "block text-sm font-medium text-foreground mb-2",
                          children: "Scope *",
                        }),
                        _jsxs("div", {
                          className: "flex gap-2",
                          children: [
                            _jsx("button", {
                              type: "button",
                              onClick: () =>
                                setMcpFormData((prev) => ({
                                  ...prev,
                                  scope: "user",
                                  projectPath: "",
                                })),
                              className:
                                `flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                  mcpFormData.scope === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`,
                              children: _jsxs("div", {
                                className:
                                  "flex items-center justify-center gap-2",
                                children: [
                                  _jsx(Globe, { className: "w-4 h-4" }),
                                  _jsx("span", {
                                    children: "User (Global)",
                                  }),
                                ],
                              }),
                            }),
                            _jsx("button", {
                              type: "button",
                              onClick: () =>
                                setMcpFormData((prev) => ({
                                  ...prev,
                                  scope: "local",
                                })),
                              className:
                                `flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                  mcpFormData.scope === "local"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`,
                              children: _jsxs("div", {
                                className:
                                  "flex items-center justify-center gap-2",
                                children: [
                                  _jsx(FolderOpen, {
                                    className: "w-4 h-4",
                                  }),
                                  _jsx("span", {
                                    children: "Project (Local)",
                                  }),
                                ],
                              }),
                            }),
                          ],
                        }),
                        _jsx("p", {
                          className: "text-xs text-muted-foreground mt-2",
                          children: mcpFormData.scope === "user"
                            ? "User scope: Available across all projects on your machine"
                            : "Local scope: Only available in the selected project",
                        }),
                      ],
                    }),
                    mcpFormData.scope === "local" &&
                    !editingMcpServer &&
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className:
                            "block text-sm font-medium text-foreground mb-2",
                          children: "Project *",
                        }),
                        _jsxs("select", {
                          value: mcpFormData.projectPath,
                          onChange: (e) =>
                            setMcpFormData((prev) => ({
                              ...prev,
                              projectPath: e.target.value,
                            })),
                          className:
                            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                          required: mcpFormData.scope === "local",
                          children: [
                            _jsx("option", {
                              value: "",
                              children: "Select a project...",
                            }),
                            projects.map((project) =>
                              _jsx(
                                "option",
                                {
                                  value: project.path || project.fullPath,
                                  children: project.displayName || project.name,
                                },
                                project.name,
                              )
                            ),
                          ],
                        }),
                        mcpFormData.projectPath &&
                        _jsxs("p", {
                          className: "text-xs text-muted-foreground mt-1",
                          children: ["Path: ", mcpFormData.projectPath],
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                  children: [
                    _jsxs("div", {
                      className: mcpFormData.importMode === "json"
                        ? "md:col-span-2"
                        : "",
                      children: [
                        _jsx("label", {
                          className:
                            "block text-sm font-medium text-foreground mb-2",
                          children: "Server Name *",
                        }),
                        _jsx(Input, {
                          value: mcpFormData.name,
                          onChange: (e) => {
                            setMcpFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }));
                          },
                          placeholder: "my-server",
                          required: true,
                        }),
                      ],
                    }),
                    mcpFormData.importMode === "form" &&
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className:
                            "block text-sm font-medium text-foreground mb-2",
                          children: "Transport Type *",
                        }),
                        _jsxs("select", {
                          value: mcpFormData.type,
                          onChange: (e) => {
                            setMcpFormData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }));
                          },
                          className:
                            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                          children: [
                            _jsx("option", {
                              value: "stdio",
                              children: "stdio",
                            }),
                            _jsx("option", {
                              value: "sse",
                              children: "SSE",
                            }),
                            _jsx("option", {
                              value: "http",
                              children: "HTTP",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                editingMcpServer &&
                mcpFormData.raw &&
                mcpFormData.importMode === "form" &&
                _jsxs("div", {
                  className:
                    "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4",
                  children: [
                    _jsxs("h4", {
                      className: "text-sm font-medium text-foreground mb-2",
                      children: [
                        "Configuration Details (from",
                        " ",
                        editingMcpServer.scope === "global"
                          ? "~/.gemini.json"
                          : "project config",
                        ")",
                      ],
                    }),
                    _jsx("pre", {
                      className:
                        "text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto",
                      children: JSON.stringify(mcpFormData.raw, null, 2),
                    }),
                  ],
                }),
                mcpFormData.importMode === "json" &&
                _jsx("div", {
                  className: "space-y-4",
                  children: _jsxs("div", {
                    children: [
                      _jsx("label", {
                        className:
                          "block text-sm font-medium text-foreground mb-2",
                        children: "JSON Configuration *",
                      }),
                      _jsx("textarea", {
                        value: mcpFormData.jsonInput,
                        onChange: (e) => {
                          setMcpFormData((prev) => ({
                            ...prev,
                            jsonInput: e.target.value,
                          }));
                          // Validate JSON as user types
                          try {
                            if (e.target.value.trim()) {
                              const parsed = JSON.parse(e.target.value);
                              // Basic validation
                              if (!parsed.type) {
                                setJsonValidationError(
                                  "Missing required field: type",
                                );
                              } else if (
                                parsed.type === "stdio" &&
                                !parsed.command
                              ) {
                                setJsonValidationError(
                                  "stdio type requires a command field",
                                );
                              } else if (
                                (parsed.type === "http" ||
                                  parsed.type === "sse") &&
                                !parsed.url
                              ) {
                                setJsonValidationError(
                                  `${parsed.type} type requires a url field`,
                                );
                              } else {
                                setJsonValidationError("");
                              }
                            }
                          } catch (err) {
                            if (e.target.value.trim()) {
                              setJsonValidationError("Invalid JSON format");
                            } else {
                              setJsonValidationError("");
                            }
                          }
                        },
                        className: `w-full px-3 py-2 border ${
                          jsonValidationError
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm`,
                        rows: 8,
                        placeholder:
                          '{\n  "type": "stdio",\n  "command": "/path/to/server",\n  "args": ["--api-key", "abc123"],\n  "env": {\n    "CACHE_DIR": "/tmp"\n  }\n}',
                        required: true,
                      }),
                      jsonValidationError &&
                      _jsx("p", {
                        className: "text-xs text-red-500 mt-1",
                        children: jsonValidationError,
                      }),
                      _jsxs("p", {
                        className: "text-xs text-muted-foreground mt-2",
                        children: [
                          "Paste your MCP server configuration in JSON format. Example formats:",
                          _jsx("br", {}),
                          "\u2022 stdio:",
                          " ",
                          `{"type":"stdio","command":"npx","args":["@upstash/context7-mcp"]}`,
                          _jsx("br", {}),
                          "\u2022 http/sse:",
                          " ",
                          `{"type":"http","url":"https://api.example.com/mcp"}`,
                        ],
                      }),
                    ],
                  }),
                }),
                mcpFormData.importMode === "form" &&
                mcpFormData.type === "stdio" &&
                _jsxs("div", {
                  className: "space-y-4",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className:
                            "block text-sm font-medium text-foreground mb-2",
                          children: "Command *",
                        }),
                        _jsx(Input, {
                          value: mcpFormData.config.command,
                          onChange: (e) =>
                            updateMcpConfig("command", e.target.value),
                          placeholder: "/path/to/mcp-server",
                          required: true,
                        }),
                      ],
                    }),
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className:
                            "block text-sm font-medium text-foreground mb-2",
                          children: "Arguments (one per line)",
                        }),
                        _jsx("textarea", {
                          value: Array.isArray(mcpFormData.config.args)
                            ? mcpFormData.config.args.join("\n")
                            : "",
                          onChange: (e) =>
                            updateMcpConfig(
                              "args",
                              e.target.value
                                .split("\n")
                                .filter((arg) => arg.trim()),
                            ),
                          className:
                            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                          rows: 3,
                          placeholder: "--api-key\nabc123",
                        }),
                      ],
                    }),
                  ],
                }),
                mcpFormData.importMode === "form" &&
                (mcpFormData.type === "sse" ||
                  mcpFormData.type === "http") &&
                _jsxs("div", {
                  children: [
                    _jsx("label", {
                      className:
                        "block text-sm font-medium text-foreground mb-2",
                      children: "URL *",
                    }),
                    _jsx(Input, {
                      value: mcpFormData.config.url,
                      onChange: (e) => updateMcpConfig("url", e.target.value),
                      placeholder: "https://api.example.com/mcp",
                      type: "url",
                      required: true,
                    }),
                  ],
                }),
                mcpFormData.importMode === "form" &&
                _jsxs("div", {
                  children: [
                    _jsx("label", {
                      className:
                        "block text-sm font-medium text-foreground mb-2",
                      children:
                        "Environment Variables (KEY=value, one per line)",
                    }),
                    _jsx("textarea", {
                      value: Object.entries(mcpFormData.config.env || {})
                        .map(([k, v]) => `${k}=${v}`)
                        .join("\n"),
                      onChange: (e) => {
                        const env = {};
                        e.target.value.split("\n").forEach((line) => {
                          const [key, ...valueParts] = line.split("=");
                          if (key && key.trim()) {
                            env[key.trim()] = valueParts.join("=").trim();
                          }
                        });
                        updateMcpConfig("env", env);
                      },
                      className:
                        "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                      rows: 3,
                      placeholder: "API_KEY=your-key\nDEBUG=true",
                    }),
                  ],
                }),
                mcpFormData.importMode === "form" &&
                (mcpFormData.type === "sse" ||
                  mcpFormData.type === "http") &&
                _jsxs("div", {
                  children: [
                    _jsx("label", {
                      className:
                        "block text-sm font-medium text-foreground mb-2",
                      children: "Headers (KEY=value, one per line)",
                    }),
                    _jsx("textarea", {
                      value: Object.entries(
                        mcpFormData.config.headers || {},
                      )
                        .map(([k, v]) => `${k}=${v}`)
                        .join("\n"),
                      onChange: (e) => {
                        const headers = {};
                        e.target.value.split("\n").forEach((line) => {
                          const [key, ...valueParts] = line.split("=");
                          if (key && key.trim()) {
                            headers[key.trim()] = valueParts
                              .join("=")
                              .trim();
                          }
                        });
                        updateMcpConfig("headers", headers);
                      },
                      className:
                        "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                      rows: 3,
                      placeholder:
                        "Authorization=Bearer token\nX-API-Key=your-key",
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "flex justify-end gap-2 pt-4",
                  children: [
                    _jsx(Button, {
                      type: "button",
                      variant: "outline",
                      onClick: resetMcpForm,
                      children: "Cancel",
                    }),
                    _jsx(Button, {
                      type: "submit",
                      disabled: mcpLoading,
                      className:
                        "bg-purple-600 hover:bg-purple-700 disabled:opacity-50",
                      children: mcpLoading
                        ? "Saving..."
                        : editingMcpServer
                        ? "Update Server"
                        : "Add Server",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
//# sourceMappingURL=mcp-server-management.js.map
