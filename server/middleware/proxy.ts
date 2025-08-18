import type { RequestHandler } from "express";
import fetch from "node-fetch";
/**
 * 创建 Qwen API 代理中间件
 * @returns {RequestHandler} Express 中间件函数
 */
export function createQwenProxy(
  target: string,
  username: string,
  password: string,
  pathFilter: string,
  pathPrefix: string
): RequestHandler {
  /**
   * 反向代理中间件配置
   * 支持动态目标路由和路径重写
   * 基于 http-proxy-middleware 文档实现
   */

  // 默认的代理配置选项
  return (async (req, res, next) => {
    if (req.path.startsWith(pathFilter)) {
      //@ts-ignore
      const headers = new Headers(
        //@ts-ignore
        Object.assign(req.headers, {
          ["Authorization"]: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString("base64")}`,
          ["authorization"]: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString("base64")}`,
        })
      );

      const url = new URL(req.url.slice(pathPrefix.length), target);

      console.log("url", url);
      console.log("headers", headers);
      console.log("body", req.body);

      const response = await fetch(url.href, {
        headers: Object.fromEntries(headers),
        method: req.method,
        body: JSON.stringify(req.body),
      });
      console.log(response);

      if (response.ok) {
        const data = await response.json();
        for (const key of response.headers.keys()) {
          res.status(response.status);
          //@ts-ignore
          res.header(key, response.headers.get(key));
        }
        res.json(data);
      } else {
        //@ts-ignore
        res.header(key, response.headers.get(key));
        res.status(response.status).end(await response.text());
      }
    } else {
      next();
    }
  }) as RequestHandler;
}
