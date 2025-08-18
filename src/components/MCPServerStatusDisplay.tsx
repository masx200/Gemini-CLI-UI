import type { MCPServer } from "./parseMCPServerStatus.ts";
export interface MCPServerStatusDisplayProps {
  servers: MCPServer[];
  loading?: boolean;
  error?: Error;
}

export function MCPServerStatusDisplay({
  servers,
  loading = false,
  error,
}: MCPServerStatusDisplayProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <div className="text-red-500 text-xl mr-2">❌</div>
          <h3 className="text-lg font-semibold text-red-800">加载错误</h3>
        </div>
        <p className="text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mr-2"></div>
          <h3 className="text-lg font-semibold text-gray-700">加载中...</h3>
        </div>
      </div>
    );
  }

  if (!servers || servers.length === 0) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <div className="text-blue-500 text-xl mr-2">ℹ️</div>
          <h3 className="text-lg font-semibold text-blue-800">暂无服务器</h3>
        </div>
        <p className="text-blue-600 mt-2">没有找到 MCP 服务器信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">MCP 服务器状态</h2>
        <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {servers.length} 个服务器
        </div>
      </div>

      {servers.map((server, serverIndex) => (
        <div
          key={serverIndex}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* 服务器头部 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    server.status === "Ready" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {server.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    server.status === "Ready"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {server.status === "Ready" ? "🟢 就绪" : "🔴 断开"}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {server.tools.length} 个工具
              </div>
            </div>
            <p className="text-gray-600 mt-2 text-sm">{server.description}</p>
          </div>

          {/* 工具列表 */}
          {server.tools.length > 0 && (
            <div className="p-4">
              <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                <span className="mr-2">🔧</span>
                可用工具
              </h4>
              <div className="space-y-3">
                {server.tools.map((tool, toolIndex) => (
                  <div
                    key={toolIndex}
                    className="bg-gray-50 border border-gray-100 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800 flex items-center">
                          <span className="mr-2">⚡</span>
                          {tool.name}
                        </h5>
                        {tool.description && (
                          <details>
                            <summary>show tool description</summary>
                            {tool.description && (
                              <p className="text-gray-600 text-sm mt-1 ml-6">
                                {tool.description}
                              </p>
                            )}
                          </details>
                        )}
                      </div>
                    </div> {tool.details.length > 0 && (
                    <details>
                      <summary>show tool details</summary>
                      {/* 工具详细信息 */}
                      {tool.details.length > 0 && (
                        <div className="mt-2 ml-6">
                          <div className="space-y-1">
                            {tool.details.map((detail, detailIndex) => (
                              <div
                                key={detailIndex}
                                className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200"
                              >
                                {detail}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </details>)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 单个服务器组件（可选，用于更细粒度的控制）
export interface MCPServerCardProps {
  server: MCPServer;
}

export function MCPServerCard({ server }: MCPServerCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${
              server.status === "Ready" ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <h3 className="text-lg font-semibold text-gray-800">{server.name}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              server.status === "Ready"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {server.status === "Ready" ? "🟢 就绪" : "🔴 断开"}
          </span>
        </div>
        <p className="text-gray-600 mt-2 text-sm">{server.description}</p>
      </div>

      {server.tools.length > 0 && (
        <div className="p-4">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            可用工具 ({server.tools.length})
          </h4>
          <div className="space-y-2">
            {server.tools.map((tool, index) => (
              <div key={index} className="bg-gray-50 rounded p-2">
                <div className="font-medium text-sm text-gray-800">
                  {tool.name}
                </div>
                {tool.description && (
                  <div className="text-xs text-gray-600 mt-1">
                    {tool.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
