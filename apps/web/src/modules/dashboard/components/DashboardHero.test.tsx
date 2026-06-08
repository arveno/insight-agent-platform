import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";
import { shellThemeTokens } from "../../../shared/theme/tokens";

import { dashboardStaticViewModel } from "../fixtures/dashboardStaticViewModel";
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

describe("DashboardHero", () => {
  it("renders the shared page intro copy, actions, time range, and four fact cards", () => {
    const selectedTimeRange = dashboardStaticViewModel.timeRange.options.find(
      (option) => option.key === dashboardStaticViewModel.timeRange.selectedKey
    )!;

    render(
      <TestProviders>
        <DashboardHero
          onNavigate={vi.fn()}
          onTimeRangeChange={vi.fn()}
          selectedTimeRange={selectedTimeRange}
          selectedTimeRangeKey={dashboardStaticViewModel.timeRange.selectedKey}
          viewModel={dashboardStaticViewModel}
        />
      </TestProviders>
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: "经营状态总览" })
    ).toBeNull();

    const eyebrow = screen.getByText("经营工作台");
    const title = screen.getByText("经营状态总览");
    const description = screen.getByText(
      "将核心指标、风险异常、报告证据和平台质量组织为可追问的业务工作台。"
    );
    const metricFact = screen.getByText("核心指标");
    const anomalyFact = screen.getByText("风险异常");
    const evidenceFact = screen.getByText("相关证据");
    const contextFact = screen.getByText("右侧上下文");

    expect(eyebrow.getAttribute("style")).toContain(`font-size: ${shellThemeTokens.fontSizeMeta}px`);
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
    expect(screen.getByText("2 项")).toBeTruthy();
    expect(screen.getByText("2 项关注")).toBeTruthy();
    expect(screen.getByText("2 条")).toBeTruthy();
    expect(screen.getByText("证据 / 运行轨迹 / 建议动作")).toBeTruthy();
    expect(metricFact.closest(".ant-col")?.className).toContain("ant-col-md-12");
    expect(metricFact.closest(".ant-col")?.className).toContain("ant-col-xl-6");
    expect(anomalyFact.closest(".ant-col")?.className).toContain("ant-col-xl-6");
    expect(evidenceFact.closest(".ant-col")?.className).toContain("ant-col-xl-6");
    expect(contextFact.closest(".ant-col")?.className).toContain("ant-col-xl-6");
    expect(screen.queryByText(dashboardStaticViewModel.lastUpdatedAt)).toBeNull();
    expect(screen.queryByText("关注")).toBeNull();
  });
});
