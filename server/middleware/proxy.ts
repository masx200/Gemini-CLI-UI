import {
  type Options,
  createProxyMiddleware,
  type RequestHandler,
} from "http-proxy-middleware";

/**
 * 创建 Qwen API 代理中间件
 * @returns {RequestHandler} Express 中间件函数
 */
export function createQwenProxy(
  target: string,
  username: string,
  password: string
): RequestHandler {
  /**
   * 反向代理中间件配置
   * 支持动态目标路由和路径重写
   * 基于 http-proxy-middleware 文档实现
   */

  // 默认的代理配置选项
  const defaultProxyOptions: Options = {
    changeOrigin: true,
    secure: false,
    logger: console,
    auth: `${username}:${password}`,
  };

  /**
   * Qwen API 代理配置
   * 将 /api/qwen/* 转发到 http://localhost:12345/
   */
  const qwenProxyOptions: Options = {
    ...defaultProxyOptions,
    target: target ?? "http://localhost:12345",
    pathFilter: "/api/qwen", // 只匹配 /api/qwen 开头的路径
    pathRewrite: {
      "^/api/qwen": "", // 移除 /api/qwen 前缀
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        console.log(
          `[Qwen Proxy] ${req.method} ${req.url} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`
        );
      },
      proxyRes: (proxyRes, req, res) => {
        console.log(`[Qwen Proxy] Response: ${proxyRes.statusCode}`);
      },
      error: (err, req, res, target) => {
        console.error(`[Qwen Proxy] Error:`, err.message);
      },
    },
  };

  return createProxyMiddleware(qwenProxyOptions);
}
