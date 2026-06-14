// @vitest-environment node

import { describe, expect, it } from "vitest";

import { resolveAgentRuntimeProxyOptions } from "../vite.config";

describe("resolveAgentRuntimeProxyOptions", () => {
  it("preserves the /api prefix when the proxy target is a preview host root URL", () => {
    const proxyOptions = resolveAgentRuntimeProxyOptions("http://39.96.95.159");
    const rewrite = proxyOptions?.rewrite;

    expect(proxyOptions?.target).toBe("http://39.96.95.159");
    expect(rewrite).toBeTypeOf("function");
    expect(rewrite?.("/api/auth/me")).toBe("/api/auth/me");
    expect(rewrite?.("/api/metrics")).toBe("/api/metrics");
  });

  it("maps /api requests onto an explicit target base path without duplicating the prefix", () => {
    const proxyOptions = resolveAgentRuntimeProxyOptions("http://39.96.95.159/api");
    const rewrite = proxyOptions?.rewrite;

    expect(proxyOptions?.target).toBe("http://39.96.95.159");
    expect(rewrite).toBeTypeOf("function");
    expect(rewrite?.("/api/auth/me")).toBe("/api/auth/me");
  });
});
