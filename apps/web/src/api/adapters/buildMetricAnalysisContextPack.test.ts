import { describe, expect, it } from "vitest";

import { findRuntimeMetric } from "../../shared/test/fixtures/runtimeMetrics";
import {
  buildMetricAnalysisContextPack,
  formatMetricBusinessDomainLabel,
  formatMetricContextSourceRoleLabel,
  formatMetricContextSourceTypeLabel,
  formatMetricTrendLabel
} from "./buildMetricAnalysisContextPack";

const metricFixture = findRuntimeMetric("metric-recognized-revenue");
const refundRateMetricFixture = findRuntimeMetric("metric-refund-rate");

describe("buildMetricAnalysisContextPack", () => {
  it("builds one shared metric context pack shape for both Dashboard and Metrics entry points", () => {
    const contextPack = buildMetricAnalysisContextPack(metricFixture);

    expect(contextPack).toMatchObject({
      capturedAt: metricFixture.updatedAt,
      root: {
        capturedAt: metricFixture.updatedAt,
        chips: ["营收质量", "Last 30 days", "下降 3.2%"],
        kind: "metric",
        nodeId: "metric-context-metric-recognized-revenue",
        owner: { type: "analysisTask" },
        role: "inputContext",
        sourceRef: {
          metricId: "metric-recognized-revenue",
          type: "metric"
        },
        summary:
          "当前值 ¥12.8M，阈值 收入增速 < -2% 进入关注，趋势 下降 3.2%，可结合公式和上下文来源继续分析。",
        timeRange: {
          key: "last_30_days",
          label: "Last 30 days"
        },
        title: "确认收入",
        value: "¥12.8M"
      },
      suggestedPrompt:
        "请基于 确认收入 在 Last 30 days 的表现，解释 下降 3.2% 的主要原因，并给出下一步建议。",
      traceability: "direct_refs",
      version: 1
    });

    expect(contextPack.root.children).toEqual([
      expect.objectContaining({
        chips: ["数据表", "主表"],
        kind: "dataTable",
        nodeId: "metric-context-metric-recognized-revenue-metric-context-source-revenue-table",
        title: "销售订单汇总表"
      }),
      expect.objectContaining({
        chips: ["报告", "支撑报告"],
        kind: "report",
        nodeId: "metric-context-metric-recognized-revenue-metric-context-source-revenue-report",
        title: "周经营分析报告"
      })
    ]);
    for (const level of ["medium", "high", "low"]) {
      expect(contextPack.root.chips).not.toContain(`风险 ${level}`);
    }
    expect(JSON.stringify(contextPack)).not.toContain(
      metricFixture.contextSources.find((source) => source.sourceType === "report")?.role ?? ""
    );
    expect(JSON.stringify(contextPack)).not.toContain(
      refundRateMetricFixture.contextSources.find((source) => source.sourceType === "sourceEvidence")
        ?.role ?? ""
    );
    expect(JSON.stringify(contextPack)).not.toContain('"sourceEvidence"');
  });

  it("formats shared metric presentation helpers from canonical business fields", () => {
    expect(formatMetricBusinessDomainLabel("business-domain-margin-analysis")).toBe("利润结构");
    expect(formatMetricTrendLabel(metricFixture)).toBe("下降 3.2%");
    expect(formatMetricContextSourceTypeLabel("report")).toBe("报告");
    expect(formatMetricContextSourceTypeLabel("sourceEvidence")).toBe("证据");
    expect(
      formatMetricContextSourceRoleLabel(
        metricFixture.contextSources.find((source) => source.sourceType === "report")?.role ?? ""
      )
    ).toBe("支撑报告");
    expect(
      formatMetricContextSourceRoleLabel(
        refundRateMetricFixture.contextSources.find(
          (source) => source.sourceType === "sourceEvidence"
        )?.role ?? ""
      )
    ).toBe("支撑证据");
  });
});
