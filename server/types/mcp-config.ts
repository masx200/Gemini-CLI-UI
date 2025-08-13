/**
 * MCP服务器配置类型定义
 * 基于Gemini CLI的MCP服务器配置规范
 */

export interface MCPServerConfig {
  // 必需字段（根据传输类型选择其一）
  command?: string; // Stdio传输：可执行文件路径
  url?: string; // SSE传输：SSE端点URL
  httpUrl?: string; // HTTP传输：HTTP流端点URL

  // 可选字段
  args?: string[]; // 命令行参数（Stdio传输）
  headers?: Record<string, string>; // 自定义HTTP头（SSE/HTTP传输）
  env?: Record<string, string>; // 环境变量
  cwd?: string; // 工作目录（Stdio传输）
  timeout?: number; // 请求超时时间（毫秒，默认600000）
  trust?: boolean; // 是否信任服务器（跳过确认提示）
  includeTools?: string[]; // 包含的工具列表（白名单）
  excludeTools?: string[]; // 排除的工具列表（黑名单）

  // OAuth配置
  oauth?: {
    enabled?: boolean;
    clientId?: string;
    clientSecret?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    scopes?: string[];
    redirectUri?: string;
    tokenParamName?: string;
    audiences?: string[];
  };

  // 认证提供者类型
  authProviderType?: "dynamic_discovery" | "google_credentials";
  type: "stdio" | "sse" | "http";
}

export interface MCPServersConfig {
  [serverName: string]: MCPServerConfig;
}

export interface MCPSettings {
  mcpServers: MCPServersConfig;
}

// 传输类型枚举
export type MCPTransportType = "stdio" | "sse" | "http";

// MCP服务器数据接口（用于UI显示）
export interface MCPServerData {
  id: string;
  name: string;
  type: MCPTransportType;
  scope: "user" | "project";
  projectPath?: string;
  config: MCPServerConfig;
  raw?: any;
}

// 操作结果接口
export interface MCPOperationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
