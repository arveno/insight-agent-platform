import { describe, expect, it } from "vitest";

import { findRuntimeMetric } from "../../shared/test/fixtures/runtimeMetrics";
import {
  buildMetricAnalysisContextPack,
  formatMetricBusinessDomainLabel,
  formatMetricTrendLabel
} from "./buildMetricAnalysisContextPack";

const metricFixture = findRuntimeMetric("metric-recognized-revenue");

describe("buildMetricAnalysisContextPack", () => {
  it("builds one shared metric context pack shape for both Dashboard and Metrics entry points", () => {
    const contextPack = buildMetricAnalysisContextPack(metricFixture);

    expect(contextPack).toEqual({
      capturedAt: "2026-06-12T10:30:00+08:00",
      root: {
        capturedAt: "2026-06-12T10:30:00+08:00",
        children: [
          {
            chips: ["primary_table", "dataTable"],
            kind: "dataTable",
            nodeId: "metric-context-metric-recognized-revenue-metric-context-source-revenue-table",
            owner: { type: "analysisTask" },
            role: "inputContext",
            sourceRef: {
              tableId: "table-sales-order",
              type: "dataTable"
            },
            summary: "作为确认收入的主表来源。",
            title: "销售订单汇总表"
          },
          {
            chips: ["supporting_report", "report"],
            kind: "report",
            nodeId: "metric-context-metric-recognized-revenue-metric-context-source-revenue-report",
            owner: { type: "analysisTask" },
            role: "inputContext",
            sourceRef: {
              reportId: "report-weekly-business",
              type: "report"
            },
            summary: "补充收入确认节奏和区域差异。",
            title: "周经营分析报告"
          }
        ],
        chips: ["营收质量", "Last 30 days", "下降 3.2%", "风险 medium"],
        kind: "metric",
        nodeId: "metric-context-metric-recognized-revenue",
        owner: { type: "analysisTask" },
        role: "inputContext",
        sourceRef: {
          metricId: "metric-recognized-revenue",
          type: "metric"
        },
        summary: "当前值 ¥12.8M，阈值 收入增速 < -2% 进入关注，趋势 下降 3.2%，可结合公式和上下文来源继续分析。",
        timeRange: {
          key: "last_30_days",
          label: "Last 30 days"
        },
        title: "确认收入",
        value: "¥12.8M"
      },
      suggestedPrompt: "请基于 确认收入 在 Last 30 days 的表现，解释 下降 3.2% 的主要原因，并给出下一步建议。",
      traceability: "direct_refs",
      version: 1
    });
  });

  it("formats shared metric presentation helpers from canonical business fields", () => {
    expect(formatMetricBusinessDomainLabel("business-domain-margin-analysis")).toBe("利润结构");
    expect(formatMetricTrendLabel(metricFixture)).toBe("下降 3.2%");
  });
});
