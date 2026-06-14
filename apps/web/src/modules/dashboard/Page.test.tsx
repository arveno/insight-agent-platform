import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { buildMetricAnalysisContextPack } from "../../api/adapters/buildMetricAnalysisContextPack";
import { findRuntimeMetric, runtimeMetricsFixtures } from "../../shared/test/fixtures/runtimeMetrics";
import { TestProviders } from "../../shared/test/TestProviders";
import { DashboardPage } from "./Page";

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

describe("DashboardPage", () => {
  const metricsLoader = vi.fn(async () => runtimeMetricsFixtures);

  it("renders the default time range and updates the shared-metric summary without navigation", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} onNavigate={onNavigate} />
      </TestProviders>
    );

    expect(await screen.findByRole("combobox", { name: "Dashboard time range" })).toBeTruthy();
    expect(screen.getByText("当前展示最近 30 天内的指标摘要、异常和报告入口。")).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Dashboard time range" }));
    fireEvent.click(await screen.findByText("Last 7 days"));

    expect(screen.getByText("当前展示最近 7 天内的指标摘要、异常和报告入口。")).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("renders the child dashboard sections inside DashboardHero instead of as peer sections", async () => {
    const { container } = render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} />
      </TestProviders>
    );

    const overviewSurface = (await screen.findByText("经营状态总览")).closest(".ant-card") as HTMLElement;
    const sectionText = Array.from(overviewSurface.querySelectorAll("section")).map((section) =>
      section.textContent?.replace(/\s+/g, " ").trim()
    );

    expect(overviewSurface).toBeTruthy();
    expect(sectionText).toHaveLength(4);
    expect(sectionText.some((text) => text?.includes("核心指标"))).toBe(true);
    expect(sectionText.some((text) => text?.includes("风险异常"))).toBe(true);
    expect(sectionText.some((text) => text?.includes("报告与证据"))).toBe(true);
    expect(sectionText.some((text) => text?.includes("平台质量"))).toBe(true);
    expect(screen.getByText("周经营分析报告")).toBeTruthy();
    expect(screen.getByText("季度收入证据摘要")).toBeTruthy();
    expect(screen.getByText("数据质量与任务证据")).toBeTruthy();

    expect(screen.getByText("确认收入").closest(".ant-col")?.className).toContain("ant-col-md-12");
    expect(screen.getByText("确认收入 风险摘要").closest(".ant-col")?.className).toContain(
      "ant-col-md-12"
    );
    expect(screen.getByText("周经营分析报告").closest(".ant-col")?.className).toContain(
      "ant-col-xl-8"
    );
    const platformQualityColumnClassName = screen
      .getAllByText("平台质量")
      .map((element) => element.closest(".ant-col")?.className)
      .find((className) => className?.includes("ant-col-md-12"));

    expect(platformQualityColumnClassName).toContain("ant-col-md-12");
    expect(container.querySelectorAll("main > .ant-space > .ant-space-item")).toHaveLength(1);
    expect(
      Array.from(container.querySelectorAll("main > .ant-space > .ant-space-item > section"))
    ).toHaveLength(0);
    expect(within(overviewSurface).getAllByText("Last 30 days").length).toBeGreaterThan(0);
  });

  it("builds shared metric Analysis entry plus lightweight Dashboard subtree entries", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} onNavigate={onNavigate} />
      </TestProviders>
    );

    fireEvent.click(await screen.findByRole("button", { name: "发起分析" }));
    expect(onNavigate).toHaveBeenNthCalledWith(
      1,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({ nodeId: "dashboard-node-root" })
        })
      })
    );

    fireEvent.click(
      within(screen.getByText("确认收入").closest(".ant-card")!).getByRole("button", {
        name: "分析异常"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      2,
      "analysis",
      {
        analysisContextPack: buildMetricAnalysisContextPack(
          findRuntimeMetric("metric-recognized-revenue")
        )
      }
    );

    fireEvent.click(
      within(screen.getByText("确认收入 风险摘要").closest(".ant-card")!).getByRole("button", {
        name: "带上下文分析"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      3,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({ nodeId: "dashboard-node-risk-primary-metric" })
        })
      })
    );

    fireEvent.click(
      within(screen.getByText("周经营分析报告").closest(".ant-card")!).getByRole("button", {
        name: "带上下文分析"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      4,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({
            chips: expect.arrayContaining([
              "5 条证据",
              "Workspace Northstar Retail China"
            ]),
            nodeId: "dashboard-node-report-weekly-business",
            sourceRef: {
              reportId: "report-weekly-business",
              type: "report"
            },
            summary: "建议先核对相关证据，再带上下文继续分析。",
            title: "周经营分析报告"
          })
        })
      })
    );

    fireEvent.click(
      within(screen.getByText("季度收入证据摘要").closest(".ant-card")!).getByRole("button", {
        name: "带上下文分析"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      5,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({
            chips: expect.arrayContaining(["Metric / Report", "High"]),
            nodeId: "dashboard-node-evidence-revenue-summary",
            sourceRef: {
              sourceEvidenceId: "source-evidence-q2-revenue",
              type: "sourceEvidence"
            },
            summary: "来自核心指标和报告入口的轻量证据摘要。",
            title: "季度收入证据摘要"
          })
        })
      })
    );
  });
});
