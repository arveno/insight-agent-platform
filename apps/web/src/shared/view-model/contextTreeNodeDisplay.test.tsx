import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { messages } from "../i18n/messages";
import { TestProviders } from "../test/TestProviders";
import { dashboardInspectorDraftFixture } from "../test/fixtures/dashboardInspectorDraftFixture";
import { findRuntimeMetric } from "../test/fixtures/runtimeMetrics";
import { ContextTreeNodeRow } from "../ui/lists/ContextTreeNodeRow";
import {
  createMetricRiskViewModel,
  createMetricStatusViewModel
} from "../utils/viewModelState";
import {
  formatMetricDisplayValue,
  formatMetricTrendLabel
} from "../../api/adapters/buildMetricAnalysisContextPack";
import { createContextTreeNodeDisplay } from "./contextTreeNodeDisplay";

afterEach(cleanup);

const t = (key: keyof (typeof messages)["zh-CN"]) => messages["zh-CN"][key];
const recognizedRevenueMetric = findRuntimeMetric("metric-recognized-revenue");
const recognizedRevenueNodeDisplay = {
  [dashboardInspectorDraftFixture.root.children?.[0]?.children?.[0]?.nodeId ?? ""]: {
    risk: createMetricRiskViewModel(
      recognizedRevenueMetric.riskLevel,
      recognizedRevenueMetric.thresholdSummary
    ),
    status: createMetricStatusViewModel(recognizedRevenueMetric.status),
    trendText: formatMetricTrendLabel(recognizedRevenueMetric),
    valueText: formatMetricDisplayValue(recognizedRevenueMetric)
  }
};

function requireChildNode(parent: InspectorTreeNode, title: string): InspectorTreeNode {
  const node = parent.children?.find((child) => child.title === title);

  if (!node) {
    throw new Error(`Expected child node ${title}.`);
  }

  return node;
}

function normalizeTextContent(element: HTMLElement | null | undefined): string {
  return element?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

describe("contextTreeNodeDisplay", () => {
  it("creates the compact root summary from the shared inspector tree only", () => {
    const props = createContextTreeNodeDisplay({
      activeNodeId: dashboardInspectorDraftFixture.root.nodeId,
      node: dashboardInspectorDraftFixture.root,
      t
    });

    expect(props.title).toBe("经营状态总览");
    expect(props.secondaryText).toBe("4 指标 · 3 风险 · 2 证据");
    expect(props.count).toBeUndefined();
    expect(props.badges).toBeUndefined();
    expect(props.selected).toBe(true);
  });

  it("shows section count without inventing compact badge text", () => {
    const metricSection = requireChildNode(dashboardInspectorDraftFixture.root, "核心指标");
    const props = createContextTreeNodeDisplay({
      activeNodeId: dashboardInspectorDraftFixture.root.nodeId,
      node: metricSection,
      t
    });

    expect(props.title).toBe("核心指标");
    expect(props.count).toBe(4);
    expect(props.secondaryText).toBeUndefined();
    expect(props.badges).toBeUndefined();
    expect(props.selected).toBe(false);
  });

  it("renders metric and risk rows with value plus trend but without risk or status badges when nodeDisplay is absent", () => {
    const metricSection = requireChildNode(dashboardInspectorDraftFixture.root, "核心指标");
    const recognizedRevenue = requireChildNode(metricSection, "确认收入");
    const riskSection = requireChildNode(dashboardInspectorDraftFixture.root, "风险异常");
    const inventoryRisk = requireChildNode(riskSection, "库存周转风险");

    render(
      <TestProviders>
        <>
          <ContextTreeNodeRow
            {...createContextTreeNodeDisplay({
              activeNodeId: recognizedRevenue.nodeId,
              node: recognizedRevenue,
              t
            })}
          />
          <ContextTreeNodeRow
            {...createContextTreeNodeDisplay({
              activeNodeId: inventoryRisk.nodeId,
              node: inventoryRisk,
              t
            })}
          />
        </>
      </TestProviders>
    );

    expect(screen.getByText("¥12.8M · 下降 3.2%")).toBeTruthy();
    expect(screen.getByText("5.1 turns · 下降 0.4 turns")).toBeTruthy();
    expect(screen.queryByText(/^关注$|^健康$|^中风险$|^高风险$|^低风险$/)).toBeNull();
    expect(screen.queryByText(/风险 medium|风险 high|风险 low/)).toBeNull();
  });

  it("prefers the official dashboard nodeDisplay for metric value, trend, status, and risk badges", () => {
    const metricSection = requireChildNode(dashboardInspectorDraftFixture.root, "核心指标");
    const recognizedRevenue = requireChildNode(metricSection, "确认收入");

    render(
      <TestProviders>
        <ContextTreeNodeRow
          {...createContextTreeNodeDisplay({
            activeNodeId: recognizedRevenue.nodeId,
            node: recognizedRevenue,
            nodeDisplay: recognizedRevenueNodeDisplay,
            t
          })}
        />
      </TestProviders>
    );

    const row = screen.getByText("确认收入").closest("[data-context-tree-row-state]");

    expect(normalizeTextContent(row as HTMLElement)).toContain("¥12.8M");
    expect(normalizeTextContent(row as HTMLElement)).toContain("下降 3.2%");
    expect(screen.getByText("关注")).toBeTruthy();
    expect(screen.getByText("中风险")).toBeTruthy();
  });

  it("keeps one parity-safe display model for repeated dashboard and analysis consumers", () => {
    const metricSection = requireChildNode(dashboardInspectorDraftFixture.root, "核心指标");
    const recognizedRevenue = requireChildNode(metricSection, "确认收入");
    const dashboardDisplay = createContextTreeNodeDisplay({
      activeNodeId: recognizedRevenue.nodeId,
      node: recognizedRevenue,
      t
    });
    const analysisDisplay = createContextTreeNodeDisplay({
      activeNodeId: recognizedRevenue.nodeId,
      node: recognizedRevenue,
      t
    });

    expect(dashboardDisplay).toEqual(analysisDisplay);
    expect(dashboardDisplay.secondaryText).toBe("¥12.8M · 下降 3.2%");
    expect(dashboardDisplay.badges).toBeUndefined();
  });

  it("formats report and evidence source meta through shared i18n labels only", () => {
    const metricSection = requireChildNode(dashboardInspectorDraftFixture.root, "核心指标");
    const revenueMetric = requireChildNode(metricSection, "确认收入");
    const refundMetric = requireChildNode(metricSection, "退款率");
    const revenueReport = requireChildNode(revenueMetric, "周经营分析报告");
    const refundEvidence = requireChildNode(refundMetric, "退款异常证据摘要");

    render(
      <TestProviders>
        <>
          <ContextTreeNodeRow
            {...createContextTreeNodeDisplay({
              activeNodeId: revenueReport.nodeId,
              node: revenueReport,
              t
            })}
          />
          <ContextTreeNodeRow
            {...createContextTreeNodeDisplay({
              activeNodeId: refundEvidence.nodeId,
              node: refundEvidence,
              t
            })}
          />
        </>
      </TestProviders>
    );

    const reportRow = screen.getByText("周经营分析报告").closest("[data-context-tree-row-state]");
    const evidenceRow = screen.getByText("退款异常证据摘要").closest("[data-context-tree-row-state]");

    expect(screen.getByText("报告 · 支撑报告")).toBeTruthy();
    expect(screen.getByText("证据 · 支撑证据")).toBeTruthy();
    expect(normalizeTextContent(reportRow as HTMLElement)).not.toContain("supporting_report");
    expect(normalizeTextContent(reportRow as HTMLElement)).not.toContain("report");
    expect(normalizeTextContent(evidenceRow as HTMLElement)).not.toContain("supporting_evidence");
    expect(normalizeTextContent(evidenceRow as HTMLElement)).not.toContain("sourceEvidence");
  });
});
