import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";
  return {
    esbuild: {
      // 生产环境下删除所有 console.* 和 debugger
      drop: isProduction ? ["console", "debugger"] : [],
    },
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT) || 4009,
      proxy: {
        "/api/qwen/command/mcp/refresh": {
          target: `http://localhost:${env.PORT || 4008}`,
          ws: true,
        },
        "/api": `http://localhost:${env.PORT || 4008}`,
        "/ws": {
          target: `ws://localhost:${env.PORT || 4008}`,
          ws: true,
        },
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
