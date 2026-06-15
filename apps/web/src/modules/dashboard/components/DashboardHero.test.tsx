import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { runtimeMetricsFixtures } from "../../../shared/test/fixtures/runtimeMetrics";
import { TestProviders } from "../../../shared/test/TestProviders";
import { shellThemeTokens } from "../../../shared/theme/tokens";

import { createDashboardViewModel } from "../mappers/createDashboardViewModel";
import { DashboardHero } from "./DashboardHero";

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

const dashboardViewModel = createDashboardViewModel(runtimeMetricsFixtures, {
  workspaceId: "workspace-northstar-retail-china",
  workspaceName: "Northstar Retail China"
});

describe("DashboardHero", () => {
  it("renders the shared page intro copy, actions, time range, and three fact cards", () => {
    const onNavigate = vi.fn();
    const selectedTimeRange = dashboardViewModel.timeRange.options.find(
      (option) => option.key === dashboardViewModel.timeRange.selectedKey
    )!;

    render(
      <TestProviders>
        <DashboardHero
          onNavigate={onNavigate}
          onTimeRangeChange={vi.fn()}
          selectedTimeRange={selectedTimeRange}
          selectedTimeRangeKey={dashboardViewModel.timeRange.selectedKey}
          viewModel={dashboardViewModel}
        />
      </TestProviders>
    );

    expect(screen.queryByRole("heading", { level: 2, name: "经营状态总览" })).toBeNull();

    const eyebrow = screen.getByText("经营工作台");
    const title = screen.getByText("经营状态总览");
    const description = screen.getByText(dashboardViewModel.root.summary!);
    const metricFact = screen.getByText("核心指标");
    const anomalyFact = screen.getByText("风险异常");
    const evidenceFact = screen.getByText("相关证据");
    expect(eyebrow.getAttribute("style")).toContain(
      `font-size: ${shellThemeTokens.fontSizeMeta}px`
    );
    expect(title.getAttribute("style")).toContain(
      `font-size: ${shellThemeTokens.fontSizeHeroTitle}px`
    );
    expect(title.getAttribute("style")).toContain("font-weight: 600");
    expect(description).toBeTruthy();
    expect(screen.getByText(selectedTimeRange.description)).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Dashboard time range" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "发起分析" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看指标" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看报告" })).toBeTruthy();
    expect(screen.getByText("4 项")).toBeTruthy();
    expect(screen.getByText("3 项关注")).toBeTruthy();
    expect(screen.getByText("2 条")).toBeTruthy();
    expect(metricFact.closest(".ant-col")?.className).toContain("ant-col-md-12");
    expect(metricFact.closest(".ant-col")?.className).toContain("ant-col-xl-6");
    expect(anomalyFact.closest(".ant-col")?.className).toContain("ant-col-xl-6");
    expect(evidenceFact.closest(".ant-col")?.className).toContain("ant-col-xl-6");
    expect(screen.queryByText(dashboardViewModel.lastUpdatedAt)).toBeNull();
    expect(screen.queryByText("右侧上下文")).toBeNull();
    expect(screen.queryByText("证据 / 运行轨迹 / 建议动作")).toBeNull();
    expect(screen.queryByText("运行轨迹")).toBeNull();
    expect(screen.queryByText("建议动作")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "发起分析" }));
    expect(onNavigate).toHaveBeenCalledWith(
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({ nodeId: dashboardViewModel.root.nodeId })
        })
      })
    );
  });

  it("renders child sections inside the same overview surface", () => {
    const selectedTimeRange = dashboardViewModel.timeRange.options.find(
      (option) => option.key === dashboardViewModel.timeRange.selectedKey
    )!;

    render(
      <TestProviders>
        <DashboardHero
          onTimeRangeChange={vi.fn()}
          selectedTimeRange={selectedTimeRange}
          selectedTimeRangeKey={dashboardViewModel.timeRange.selectedKey}
          viewModel={dashboardViewModel}
        >
          <section>
            <h3>核心指标</h3>
          </section>
          <section>
            <h3>风险异常</h3>
          </section>
        </DashboardHero>
      </TestProviders>
    );

    const overviewSurface = screen.getByText("经营状态总览").closest(".ant-card") as HTMLElement;
    const sectionText = Array.from(overviewSurface.querySelectorAll("section")).map((section) =>
      section.textContent?.replace(/\s+/g, " ").trim()
    );

    expect(overviewSurface).toBeTruthy();
    expect(sectionText).toHaveLength(2);
    expect(sectionText.some((text) => text?.includes("核心指标"))).toBe(true);
    expect(sectionText.some((text) => text?.includes("风险异常"))).toBe(true);
    expect(within(overviewSurface).queryByText("Last 30 days")).toBeTruthy();
  });
});
