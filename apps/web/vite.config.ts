import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const proxyTarget = env.VITE_AGENT_RUNTIME_PROXY_TARGET?.trim();

  return {
    server: proxyTarget
      ? {
          proxy: {
            "/api": {
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ""),
              secure: false,
              target: proxyTarget
            }
          }
        }
      : undefined
  };
});
