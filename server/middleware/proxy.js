import { createProxyMiddleware, } from "http-proxy-middleware";
export function createQwenProxy(target, username, password) {
    const defaultProxyOptions = {
        changeOrigin: true,
        secure: false,
        logger: console,
        auth: `${username}:${password}`,
    };
    const qwenProxyOptions = {
        ...defaultProxyOptions,
        target: target ?? "http://localhost:12345",
        pathFilter: "/api/qwen",
        pathRewrite: {
            "^/api/qwen": "",
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(proxyReq, req, res);
            },
            proxyRes: (proxyRes, req, res) => {
                console.log(`[Qwen Proxy] Response: ${proxyRes.statusCode}`);
            },
            error: (err, req, res, target) => {
                console.error(`[Qwen Proxy] Error:`, err.message);
            },
        },
    };
    console.log(qwenProxyOptions);
    return createProxyMiddleware(qwenProxyOptions);
}
//# sourceMappingURL=proxy.js.map