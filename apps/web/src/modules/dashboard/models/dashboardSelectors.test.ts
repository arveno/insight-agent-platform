import { describe, expect, it } from "vitest";

import { runtimeMetricsFixtures } from "../../../shared/test/fixtures/runtimeMetrics";
import { createDashboardViewModel } from "../mappers/createDashboardViewModel";

import {
  selectDashboardEvidenceNodes,
  selectDashboardMetricNodes,
  selectDashboardMetricSection,
  selectDashboardReportNodes,
  selectDashboardReportEvidenceSection,
  selectDashboardRiskNodes,
  selectDashboardRiskSection
} from "./dashboardSelectors";

const dashboardViewModel = createDashboardViewModel(runtimeMetricsFixtures, {
  workspaceId: "workspace-northstar-retail-china",
  workspaceName: "Northstar Retail China"
});

describe("dashboardSelectors", () => {
  it("keeps the dashboard semantic root focused on business sections instead of a timeRange child node", () => {
    expect(dashboardViewModel.root.title).toBe("经营状态总览");
    expect(dashboardViewModel.root.timeRange).toEqual({
      key: "last_30_days",
      label: "Last 30 days"
    });
    expect(dashboardViewModel.root.children?.map((node) => node.title)).toEqual([
      "核心指标",
      "风险异常",
      "报告与证据"
    ]);
  });

  it("derives section nodes from root instead of keeping duplicate arrays on the view model", () => {
    const metricNodes = selectDashboardMetricNodes(dashboardViewModel.root);
    const riskNodes = selectDashboardRiskNodes(dashboardViewModel.root);
    const reportNodes = selectDashboardReportNodes(dashboardViewModel.root);
    const evidenceNodes = selectDashboardEvidenceNodes(dashboardViewModel.root);

    expect("metricNodes" in dashboardViewModel).toBe(false);
    expect("riskNodes" in dashboardViewModel).toBe(false);
    expect("riskSummaryNode" in dashboardViewModel).toBe(false);
    expect("reportNodes" in dashboardViewModel).toBe(false);
    expect("evidenceNodes" in dashboardViewModel).toBe(false);
    expect("qualityNodes" in dashboardViewModel).toBe(false);

    expect(selectDashboardMetricSection(dashboardViewModel.root)?.title).toBe("核心指标");
    expect(selectDashboardRiskSection(dashboardViewModel.root)?.title).toBe("风险异常");
    expect(selectDashboardReportEvidenceSection(dashboardViewModel.root)?.title).toBe("报告与证据");
    expect(metricNodes.map((node) => node.title)).toEqual([
      "确认收入",
      "毛利率",
      "退款率",
      "库存周转"
    ]);
    expect(riskNodes.map((node) => node.title)).toEqual([
      "库存周转风险",
      "确认收入风险",
      "退款率风险"
    ]);
    expect(reportNodes.map((node) => node.title)).toEqual(["周经营分析报告"]);
    expect(evidenceNodes.map((node) => node.title)).toEqual(["退款异常证据摘要"]);
    expect(metricNodes[0]).toMatchObject({
      chips: ["营收质量", "Last 30 days", "下降 3.2%"],
      summary: "已满足确认条件的收入金额。",
      title: "确认收入"
    });
    expect(riskNodes[0]).toMatchObject({
      chips: ["供应链效率", "Last 30 days"],
      summary: "库存周转 < 5.3 turns 进入关注",
      title: "库存周转风险"
    });
    expect(reportNodes[0]).toMatchObject({
      chips: ["report", "supporting_report"]
    });
    expect(evidenceNodes[0]).toMatchObject({
      chips: ["sourceEvidence", "supporting_evidence"]
    });
    expect(
      metricNodes
        .find((node) => node.title === "毛利率")
        ?.children?.map((node) => node.title)
    ).toEqual(["损益日表", "毛利率复盘纪要"]);
    expect(
      metricNodes
        .find((node) => node.title === "库存周转")
        ?.children?.map((node) => node.title)
    ).toEqual(["库存日快照表", "华东库存复核记录"]);
  });
});
