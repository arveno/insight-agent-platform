import { defineConfig, loadEnv } from "vite";
import type { ProxyOptions } from "vite";

export function resolveAgentRuntimeProxyOptions(proxyTarget?: string): ProxyOptions | undefined {
  const normalizedProxyTarget = proxyTarget?.trim();

  if (!normalizedProxyTarget) {
    return undefined;
  }

  const targetUrl = new URL(normalizedProxyTarget);
  const normalizedTargetPath =
    targetUrl.pathname === "/" ? "" : targetUrl.pathname.replace(/\/$/, "");

  return {
    changeOrigin: true,
    rewrite: (path) =>
      normalizedTargetPath.length > 0
        ? `${normalizedTargetPath}${path.replace(/^\/api/, "")}`
        : path,
    secure: false,
    target: targetUrl.origin
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const proxyOptions = resolveAgentRuntimeProxyOptions(env.VITE_AGENT_RUNTIME_PROXY_TARGET);

  return {
    server: proxyOptions
      ? {
          proxy: {
            "/api": proxyOptions
          }
        }
      : undefined
  };
});
