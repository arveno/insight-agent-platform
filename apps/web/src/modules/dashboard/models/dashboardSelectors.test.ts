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
    expect("metricNodes" in dashboardViewModel).toBe(false);
    expect("riskNodes" in dashboardViewModel).toBe(false);
    expect("riskSummaryNode" in dashboardViewModel).toBe(false);
    expect("reportNodes" in dashboardViewModel).toBe(false);
    expect("evidenceNodes" in dashboardViewModel).toBe(false);
    expect("qualityNodes" in dashboardViewModel).toBe(false);

    expect(selectDashboardMetricSection(dashboardViewModel.root)?.title).toBe("核心指标");
    expect(selectDashboardRiskSection(dashboardViewModel.root)?.title).toBe("风险异常");
    expect(selectDashboardReportEvidenceSection(dashboardViewModel.root)?.title).toBe("报告与证据");
    expect(selectDashboardMetricNodes(dashboardViewModel.root).map((node) => node.title)).toEqual([
      "确认收入",
      "毛利率",
      "退款率",
      "库存周转"
    ]);
    expect(selectDashboardRiskNodes(dashboardViewModel.root).map((node) => node.title)).toEqual([
      "库存周转风险",
      "确认收入风险",
      "退款率风险"
    ]);
    expect(selectDashboardReportNodes(dashboardViewModel.root).map((node) => node.title)).toEqual([
      "周经营分析报告"
    ]);
    expect(selectDashboardEvidenceNodes(dashboardViewModel.root).map((node) => node.title)).toEqual([
      "退款异常证据摘要"
    ]);
    expect(
      selectDashboardMetricNodes(dashboardViewModel.root)
        .find((node) => node.title === "毛利率")
        ?.children?.map((node) => node.title)
    ).toEqual(["损益日表", "毛利率复盘纪要"]);
    expect(
      selectDashboardMetricNodes(dashboardViewModel.root)
        .find((node) => node.title === "库存周转")
        ?.children?.map((node) => node.title)
    ).toEqual(["库存日快照表", "华东库存复核记录"]);
  });
});
