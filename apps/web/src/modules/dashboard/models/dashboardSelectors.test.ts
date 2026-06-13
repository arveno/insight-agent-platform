import { describe, expect, it } from "vitest";

import { dashboardStaticViewModel } from "../fixtures/dashboardStaticViewModel";

import {
  selectDashboardEvidenceNodes,
  selectDashboardMetricNodes,
  selectDashboardMetricSection,
  selectDashboardQualityNodes,
  selectDashboardQualitySection,
  selectDashboardReportNodes,
  selectDashboardReportEvidenceSection,
  selectDashboardRiskNodes,
  selectDashboardRiskSection,
  selectDashboardRiskSummaryNode
} from "./dashboardSelectors";

describe("dashboardSelectors", () => {
  it("keeps the dashboard semantic root focused on business sections instead of a timeRange child node", () => {
    expect(dashboardStaticViewModel.root.title).toBe("经营状态总览");
    expect(dashboardStaticViewModel.root.timeRange).toEqual({
      key: "last_30_days",
      label: "Last 30 days"
    });
    expect(dashboardStaticViewModel.root.children?.map((node) => node.title)).toEqual([
      "核心指标",
      "风险异常",
      "报告与证据",
      "平台质量"
    ]);
  });

  it("derives section nodes from root instead of keeping duplicate arrays on the view model", () => {
    expect("metricNodes" in dashboardStaticViewModel).toBe(false);
    expect("riskNodes" in dashboardStaticViewModel).toBe(false);
    expect("riskSummaryNode" in dashboardStaticViewModel).toBe(false);
    expect("reportNodes" in dashboardStaticViewModel).toBe(false);
    expect("evidenceNodes" in dashboardStaticViewModel).toBe(false);
    expect("qualityNodes" in dashboardStaticViewModel).toBe(false);

    expect(selectDashboardMetricSection(dashboardStaticViewModel.root)?.title).toBe("核心指标");
    expect(selectDashboardRiskSection(dashboardStaticViewModel.root)?.title).toBe("风险异常");
    expect(selectDashboardReportEvidenceSection(dashboardStaticViewModel.root)?.title).toBe("报告与证据");
    expect(selectDashboardQualitySection(dashboardStaticViewModel.root)?.title).toBe("平台质量");
    expect(selectDashboardMetricNodes(dashboardStaticViewModel.root).map((node) => node.title)).toEqual([
      "零售收入",
      "毛利率"
    ]);
    expect(selectDashboardRiskNodes(dashboardStaticViewModel.root).map((node) => node.title)).toEqual([
      "收入增速异常"
    ]);
    expect(selectDashboardRiskSummaryNode(dashboardStaticViewModel.root)?.title).toBe("风险摘要");
    expect(selectDashboardReportNodes(dashboardStaticViewModel.root).map((node) => node.title)).toEqual([
      "周经营分析报告"
    ]);
    expect(selectDashboardEvidenceNodes(dashboardStaticViewModel.root).map((node) => node.title)).toEqual([
      "零售收入证据摘要",
      "数据质量与任务证据"
    ]);
    expect(selectDashboardQualityNodes(dashboardStaticViewModel.root).map((node) => node.title)).toEqual([
      "平台质量"
    ]);
  });
});
