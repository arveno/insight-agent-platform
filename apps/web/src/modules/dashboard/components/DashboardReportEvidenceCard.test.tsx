import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";
import { dashboardStaticViewModel } from "../fixtures/dashboardStaticViewModel";
import {
  selectDashboardEvidenceNodes,
  selectDashboardReportNodes
} from "../models/dashboardSelectors";
import { DashboardReportEvidenceCard } from "./DashboardReportEvidenceCard";

afterEach(cleanup);

describe("DashboardReportEvidenceCard", () => {
  it("composes report actions and meta inside the business card component", () => {
    const onNavigate = vi.fn();
    const report = selectDashboardReportNodes(dashboardStaticViewModel.root)[0]!;

    render(
      <TestProviders>
        <DashboardReportEvidenceCard
          kind="report"
          onNavigate={onNavigate}
          report={report}
          viewModel={dashboardStaticViewModel}
        />
      </TestProviders>
    );

    expect(screen.getByText("最近报告")).toBeTruthy();
    expect(screen.getByText("周经营分析报告")).toBeTruthy();
    expect(screen.getByText("建议先核对相关证据，再带上下文继续分析。")).toBeTruthy();
    expect(screen.getByText("更新时间 2026-06-03T17:30:00+08:00")).toBeTruthy();
    expect(screen.getByText("5 条证据")).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看报告" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看建议" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "带上下文分析" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "带上下文分析" }));
    expect(onNavigate).toHaveBeenCalledWith(
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({ nodeId: report.nodeId })
        })
      })
    );
  });

  it("maps evidence meta inside the business card component and keeps evidence actions local", () => {
    const onNavigate = vi.fn();
    const evidence = selectDashboardEvidenceNodes(dashboardStaticViewModel.root)[0]!;

    render(
      <TestProviders>
        <DashboardReportEvidenceCard
          evidence={evidence}
          kind="evidence"
          onNavigate={onNavigate}
          viewModel={dashboardStaticViewModel}
        />
      </TestProviders>
    );

    expect(screen.getByText("证据")).toBeTruthy();
    expect(screen.getByText("季度收入证据摘要")).toBeTruthy();
    expect(screen.getByText("来自核心收入指标、报告段落和数据质量摘要的证据入口。")).toBeTruthy();
    expect(screen.getByText("指标 / 报告")).toBeTruthy();
    expect(screen.getByText("高可信度")).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看证据" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "带上下文分析" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看数据来源" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看运行轨迹" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "带上下文分析" }));
    expect(onNavigate).toHaveBeenCalledWith(
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({ nodeId: evidence.nodeId })
        })
      })
    );
  });
});
