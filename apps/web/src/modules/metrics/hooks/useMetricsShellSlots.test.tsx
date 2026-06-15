import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../../../api/adapters/loadWorkspaceMetrics", async () => {
  const fixtures = await import("../../../shared/test/fixtures/runtimeMetrics");

  return {
    loadWorkspaceMetric: vi.fn(async (metricId: string) => fixtures.findRuntimeMetric(metricId)),
    loadWorkspaceMetrics: vi.fn(async () => fixtures.runtimeMetricsFixtures)
  };
});

import { TestProviders } from "../../../shared/test/TestProviders";
import { messages } from "../../../shared/i18n/messages";

import { useMetricsShellSlots } from "./useMetricsShellSlots";

afterEach(cleanup);

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined
    })
  });
});

const zhCnMessages = messages["zh-CN"];

function MetricsShellSlotHarness() {
  const slots = useMetricsShellSlots({
    onBackToRoot: vi.fn(),
    onNavigate: vi.fn()
  });

  return (
    <>
      {slots.leftNav}
      {slots.mainContent}
      {slots.rightAssistPanel}
    </>
  );
}

describe("useMetricsShellSlots", () => {
  it("exposes metrics navigation, main content, and inspector as module-owned shell regions", async () => {
    render(
      <TestProviders>
        <MetricsShellSlotHarness />
      </TestProviders>
    );

    expect(await screen.findByText("当前指标详情：确认收入")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Metrics navigation" })).toBeTruthy();
    expect(screen.getByText("指标总览")).toBeTruthy();
    expect(screen.getByText("指标辅助区")).toBeTruthy();
    expect(screen.getAllByText("库存周转").length).toBeGreaterThan(0);
    expect(screen.getAllByText(zhCnMessages["risk.high.title"]).length).toBeGreaterThan(0);
  });
});
