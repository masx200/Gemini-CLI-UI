import {
  Globe, Plus,
  Server, X
} from "lucide-react";
export default function McpServerManagement({ mcpServers, openMcpForm }) {
 return <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Server className="w-5 h-5 text-purple-500" />
      <h3 className="text-lg font-medium text-foreground">MCP Servers</h3>
    </div>
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Model Context Protocol servers provide additional tools and data sources
        to Claude
      </p>
    </div>

    <div className="flex justify-between items-center">
      <Button
        onClick={() => openMcpForm()}
        className="bg-purple-600 hover:bg-purple-700 text-white"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add MCP Server
      </Button>
    </div>

    {/* MCP Servers List */}
    <div className="space-y-2">
      {mcpServers.map((server) => (
        <div
          key={server.id}
          className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getTransportIcon(server.type)}
                <span className="font-medium text-foreground">
                  {server.name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {server.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {server.scope === "local"
                    ? "📁 local"
                    : server.scope === "user"
                    ? "👤 user"
                    : server.scope}
                </Badge>
                {server.projectPath && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-purple-50 dark:bg-purple-900/20"
                    title={server.projectPath}
                  >
                    {server.projectPath.split("/").pop()}
                  </Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                {server.type === "stdio" && server.config.command && (
                  <div>
                    Command:{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                      {server.config.command}
                    </code>
                  </div>
                )}
                {(server.type === "sse" || server.type === "http") &&
                  server.config.url && (
                    <div>
                      URL:{" "}
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                        {server.config.url}
                      </code>
                    </div>
                  )}
                {server.config.args && server.config.args.length > 0 && (
                  <div>
                    Args:{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                      {server.config.args.join(" ")}
                    </code>
                  </div>
                )}
                {server.config.env &&
                  Object.keys(server.config.env).length > 0 && (
                    <div>
                      Environment:{" "}
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                        {Object.entries(server.config.env)
                          .map(([k, v]) => `${k}=${v}`)
                          .join(", ")}
                      </code>
                    </div>
                  )}
                {server.raw && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      View full config
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(server.raw, null, 2)}
                    </pre>
                  </details>
                )}
              </div>

              {/* Test Results */}
              {mcpTestResults[server.id] && (
                <div
                  className={`mt-2 p-2 rounded text-xs ${
                    mcpTestResults[server.id].success
                      ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                  }`}
                >
                  <div className="font-medium">
                    {mcpTestResults[server.id].message}
                  </div>
                  {mcpTestResults[server.id].details &&
                    mcpTestResults[server.id].details.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {mcpTestResults[server.id].details.map((detail, i) => (
                          <li key={i}>• {detail}</li>
                        ))}
                      </ul>
                    )}
                </div>
              )}

              {/* Tools Discovery Results */}
              {mcpServerTools[server.id] && (
                <div className="mt-2 p-2 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  <div className="font-medium mb-2">
                    Available Tools & Resources
                  </div>

                  {mcpServerTools[server.id].tools &&
                    mcpServerTools[server.id].tools.length > 0 && (
                      <div className="mb-2">
                        <div className="font-medium text-xs mb-1">
                          Tools ({mcpServerTools[server.id].tools.length}):
                        </div>
                        <ul className="space-y-0.5">
                          {mcpServerTools[server.id].tools.map((tool, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-blue-400 mt-0.5">•</span>
                              <div>
                                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                                  {tool.name}
                                </code>
                                {tool.description &&
                                  tool.description !==
                                    "No description provided" && (
                                    <span className="ml-1 text-xs opacity-75">
                                      - {tool.description}
                                    </span>
                                  )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {mcpServerTools[server.id].resources &&
                    mcpServerTools[server.id].resources.length > 0 && (
                      <div className="mb-2">
                        <div className="font-medium text-xs mb-1">
                          Resources (
                          {mcpServerTools[server.id].resources.length}):
                        </div>
                        <ul className="space-y-0.5">
                          {mcpServerTools[server.id].resources.map(
                            (resource, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-blue-400 mt-0.5">•</span>
                                <div>
                                  <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                                    {resource.name}
                                  </code>
                                  {resource.description &&
                                    resource.description !==
                                      "No description provided" && (
                                      <span className="ml-1 text-xs opacity-75">
                                        - {resource.description}
                                      </span>
                                    )}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {mcpServerTools[server.id].prompts &&
                    mcpServerTools[server.id].prompts.length > 0 && (
                      <div>
                        <div className="font-medium text-xs mb-1">
                          Prompts ({mcpServerTools[server.id].prompts.length}):
                        </div>
                        <ul className="space-y-0.5">
                          {mcpServerTools[server.id].prompts.map(
                            (prompt, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-blue-400 mt-0.5">•</span>
                                <div>
                                  <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                                    {prompt.name}
                                  </code>
                                  {prompt.description &&
                                    prompt.description !==
                                      "No description provided" && (
                                      <span className="ml-1 text-xs opacity-75">
                                        - {prompt.description}
                                      </span>
                                    )}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {(!mcpServerTools[server.id].tools ||
                    mcpServerTools[server.id].tools.length === 0) &&
                    (!mcpServerTools[server.id].resources ||
                      mcpServerTools[server.id].resources.length === 0) &&
                    (!mcpServerTools[server.id].prompts ||
                      mcpServerTools[server.id].prompts.length === 0) && (
                      <div className="text-xs opacity-75">
                        No tools, resources, or prompts discovered
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={() => openMcpForm(server)}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title="Edit server"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleMcpDelete(server.id, server.scope)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Delete server"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      {mcpServers.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No MCP servers configured
        </div>
      )}
    </div>
  </div>;

  {
    /* MCP Server Form Modal */
  }
  {
    showMcpForm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
        <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-medium text-foreground">
              {editingMcpServer ? "Edit MCP Server" : "Add MCP Server"}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetMcpForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleMcpSubmit} className="p-4 space-y-4">
            {!editingMcpServer && (
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() =>
                    setMcpFormData((prev) => ({ ...prev, importMode: "form" }))
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    mcpFormData.importMode === "form"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Form Input
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMcpFormData((prev) => ({ ...prev, importMode: "json" }))
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    mcpFormData.importMode === "json"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  JSON Import
                </button>
              </div>
            )}

            {/* Show current scope when editing */}
            {mcpFormData.importMode === "form" && editingMcpServer && (
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Scope
                </label>
                <div className="flex items-center gap-2">
                  {mcpFormData.scope === "user" ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <FolderOpen className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {mcpFormData.scope === "user"
                      ? "User (Global)"
                      : "Project (Local)"}
                  </span>
                  {mcpFormData.scope === "local" && mcpFormData.projectPath && (
                    <span className="text-xs text-muted-foreground">
                      - {mcpFormData.projectPath}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Scope cannot be changed when editing an existing server
                </p>
              </div>
            )}

            {/* Scope Selection - Moved to top, disabled when editing */}
            {mcpFormData.importMode === "form" && !editingMcpServer && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Scope *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMcpFormData((prev) => ({
                          ...prev,
                          scope: "user",
                          projectPath: "",
                        }))
                      }
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        mcpFormData.scope === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>User (Global)</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMcpFormData((prev) => ({ ...prev, scope: "local" }))
                      }
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        mcpFormData.scope === "local"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        <span>Project (Local)</span>
                      </div>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {mcpFormData.scope === "user"
                      ? "User scope: Available across all projects on your machine"
                      : "Local scope: Only available in the selected project"}
                  </p>
                </div>

                {/* Project Selection for Local Scope */}
                {mcpFormData.scope === "local" && !editingMcpServer && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Project *
                    </label>
                    <select
                      value={mcpFormData.projectPath}
                      onChange={(e) =>
                        setMcpFormData((prev) => ({
                          ...prev,
                          projectPath: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required={mcpFormData.scope === "local"}
                    >
                      <option value="">Select a project...</option>
                      {projects.map((project) => (
                        <option
                          key={project.name}
                          value={project.path || project.fullPath}
                        >
                          {project.displayName || project.name}
                        </option>
                      ))}
                    </select>
                    {mcpFormData.projectPath && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Path: {mcpFormData.projectPath}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={
                  mcpFormData.importMode === "json" ? "md:col-span-2" : ""
                }
              >
                <label className="block text-sm font-medium text-foreground mb-2">
                  Server Name *
                </label>
                <Input
                  value={mcpFormData.name}
                  onChange={(e) => {
                    setMcpFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }));
                  }}
                  placeholder="my-server"
                  required
                />
              </div>

              {mcpFormData.importMode === "form" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Transport Type *
                  </label>
                  <select
                    value={mcpFormData.type}
                    onChange={(e) => {
                      setMcpFormData((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="stdio">stdio</option>
                    <option value="sse">SSE</option>
                    <option value="http">HTTP</option>
                  </select>
                </div>
              )}
            </div>

            {/* Show raw configuration details when editing */}
            {editingMcpServer &&
              mcpFormData.raw &&
              mcpFormData.importMode === "form" && (
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Configuration Details (from{" "}
                    {editingMcpServer.scope === "global"
                      ? "~/.claude.json"
                      : "project config"}
                    )
                  </h4>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                    {JSON.stringify(mcpFormData.raw, null, 2)}
                  </pre>
                </div>
              )}

            {/* JSON Import Mode */}
            {mcpFormData.importMode === "json" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    JSON Configuration *
                  </label>
                  <textarea
                    value={mcpFormData.jsonInput}
                    onChange={(e) => {
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
                              "Missing required field: type"
                            );
                          } else if (
                            parsed.type === "stdio" &&
                            !parsed.command
                          ) {
                            setJsonValidationError(
                              "stdio type requires a command field"
                            );
                          } else if (
                            (parsed.type === "http" || parsed.type === "sse") &&
                            !parsed.url
                          ) {
                            setJsonValidationError(
                              `${parsed.type} type requires a url field`
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
                    }}
                    className={`w-full px-3 py-2 border ${
                      jsonValidationError
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm`}
                    rows="8"
                    placeholder={
                      '{\n  "type": "stdio",\n  "command": "/path/to/server",\n  "args": ["--api-key", "abc123"],\n  "env": {\n    "CACHE_DIR": "/tmp"\n  }\n}'
                    }
                    required
                  />
                  {jsonValidationError && (
                    <p className="text-xs text-red-500 mt-1">
                      {jsonValidationError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Paste your MCP server configuration in JSON format. Example
                    formats:
                    <br />• stdio:{" "}
                    {`{"type":"stdio","command":"npx","args":["@upstash/context7-mcp"]}`}
                    <br />• http/sse:{" "}
                    {`{"type":"http","url":"https://api.example.com/mcp"}`}
                  </p>
                </div>
              </div>
            )}

            {/* Transport-specific Config - Only show in form mode */}
            {mcpFormData.importMode === "form" &&
              mcpFormData.type === "stdio" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Command *
                    </label>
                    <Input
                      value={mcpFormData.config.command}
                      onChange={(e) =>
                        updateMcpConfig("command", e.target.value)
                      }
                      placeholder="/path/to/mcp-server"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Arguments (one per line)
                    </label>
                    <textarea
                      value={
                        Array.isArray(mcpFormData.config.args)
                          ? mcpFormData.config.args.join("\n")
                          : ""
                      }
                      onChange={(e) =>
                        updateMcpConfig(
                          "args",
                          e.target.value.split("\n").filter((arg) => arg.trim())
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="--api-key&#10;abc123"
                    />
                  </div>
                </div>
              )}

            {mcpFormData.importMode === "form" &&
              (mcpFormData.type === "sse" || mcpFormData.type === "http") && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URL *
                  </label>
                  <Input
                    value={mcpFormData.config.url}
                    onChange={(e) => updateMcpConfig("url", e.target.value)}
                    placeholder="https://api.example.com/mcp"
                    type="url"
                    required
                  />
                </div>
              )}

            {/* Environment Variables - Only show in form mode */}
            {mcpFormData.importMode === "form" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Environment Variables (KEY=value, one per line)
                </label>
                <textarea
                  value={Object.entries(mcpFormData.config.env || {})
                    .map(([k, v]) => `${k}=${v}`)
                    .join("\n")}
                  onChange={(e) => {
                    const env = {};
                    e.target.value.split("\n").forEach((line) => {
                      const [key, ...valueParts] = line.split("=");
                      if (key && key.trim()) {
                        env[key.trim()] = valueParts.join("=").trim();
                      }
                    });
                    updateMcpConfig("env", env);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="API_KEY=your-key&#10;DEBUG=true"
                />
              </div>
            )}

            {mcpFormData.importMode === "form" &&
              (mcpFormData.type === "sse" || mcpFormData.type === "http") && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Headers (KEY=value, one per line)
                  </label>
                  <textarea
                    value={Object.entries(mcpFormData.config.headers || {})
                      .map(([k, v]) => `${k}=${v}`)
                      .join("\n")}
                    onChange={(e) => {
                      const headers = {};
                      e.target.value.split("\n").forEach((line) => {
                        const [key, ...valueParts] = line.split("=");
                        if (key && key.trim()) {
                          headers[key.trim()] = valueParts.join("=").trim();
                        }
                      });
                      updateMcpConfig("headers", headers);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Authorization=Bearer token&#10;X-API-Key=your-key"
                  />
                </div>
              )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetMcpForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mcpLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {mcpLoading
                  ? "Saving..."
                  : editingMcpServer
                  ? "Update Server"
                  : "Add Server"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
