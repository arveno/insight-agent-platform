import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { messages } from "../../../shared/i18n/messages";
import { runtimeMetricsFixtures } from "../../../shared/test/fixtures/runtimeMetrics";
import { TestProviders } from "../../../shared/test/TestProviders";
import { createDashboardViewModel } from "../mappers/createDashboardViewModel";
import {
  selectDashboardEvidenceNodes,
  selectDashboardReportNodes
} from "../models/dashboardSelectors";
import { DashboardReportEvidenceCard } from "./DashboardReportEvidenceCard";

afterEach(cleanup);

const dashboardViewModel = createDashboardViewModel(runtimeMetricsFixtures, {
  workspaceId: "workspace-northstar-retail-china",
  workspaceName: "Northstar Retail China"
});
const zhCnMessages = messages["zh-CN"];

describe("DashboardReportEvidenceCard", () => {
  it("keeps only the report context analysis action and user-facing meta on the card", () => {
    const onNavigate = vi.fn();
    const report = selectDashboardReportNodes(dashboardViewModel.root)[0]!;

    render(
      <TestProviders>
        <DashboardReportEvidenceCard
          kind="report"
          onNavigate={onNavigate}
          report={report}
          viewModel={dashboardViewModel}
        />
      </TestProviders>
    );

    expect(screen.getByText("最近报告")).toBeTruthy();
    expect(screen.getByText("周经营分析报告")).toBeTruthy();
    expect(screen.getByText("补充收入确认节奏、区域差异和渠道复核建议的只读摘要。")).toBeTruthy();
    expect(screen.getByText("报告 · 支撑报告")).toBeTruthy();
    expect(
      screen.queryByText(
        [
          report.kind,
          runtimeMetricsFixtures[0]?.contextSources.find((source) => source.sourceType === "report")
            ?.role ?? ""
        ].join(" · ")
      )
    ).toBeNull();
    expect(screen.queryByText(/更新时间/)).toBeNull();
    expect(screen.queryByRole("button", { name: "查看报告" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: zhCnMessages["dashboard.action.viewSuggestions"] })
    ).toBeNull();
    expect(screen.getByRole("button", { name: "带报告上下文分析" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "带报告上下文分析" }));
    expect(onNavigate).toHaveBeenCalledWith(
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({ nodeId: report.nodeId })
        })
      })
    );
  });

  it("keeps only the evidence context analysis action and user-facing meta on the card", () => {
    const onNavigate = vi.fn();
    const evidence = selectDashboardEvidenceNodes(dashboardViewModel.root)[0]!;

    render(
      <TestProviders>
        <DashboardReportEvidenceCard
          evidence={evidence}
          kind="evidence"
          onNavigate={onNavigate}
          viewModel={dashboardViewModel}
        />
      </TestProviders>
    );

    expect(screen.getByText("证据")).toBeTruthy();
    expect(screen.getByText("退款异常证据摘要")).toBeTruthy();
    expect(screen.getByText("记录近期退款率抬升和客服标签聚合后的证据摘要。")).toBeTruthy();
    expect(screen.getByText("证据 · 支撑证据")).toBeTruthy();
    expect(
      screen.queryByText(
        [
          evidence.kind,
          runtimeMetricsFixtures[2]?.contextSources.find(
            (source) => source.sourceType === "sourceEvidence"
          )?.role ?? ""
        ].join(" · ")
      )
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: zhCnMessages["dashboard.action.viewEvidence"] })
    ).toBeNull();
    expect(screen.getByRole("button", { name: "带证据上下文分析" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: zhCnMessages["dashboard.action.viewDataKnowledge"] })
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: zhCnMessages["dashboard.action.viewTrace"] })
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "带证据上下文分析" }));
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
