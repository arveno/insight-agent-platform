import type { ReactNode } from "react";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import type { Translate } from "../../../../shared/i18n/translateKey";
import { ContextTreeNodeRow, type ContextTreeNodeRowProps } from "../../../../shared/ui/lists/ContextTreeNodeRow";
import { createContextSourceMetaText } from "../../../../shared/view-model/contextSourceDisplay";

function extractTrendLabel(node: InspectorTreeNode): string | undefined {
  const chipTrend = node.chips?.find((chip) => /^(上升|下降|持平)\s+/.test(chip));

  if (chipTrend) {
    return chipTrend;
  }

  const summaryTrend = node.summary?.match(/趋势\s*([^，。]+)/)?.[1]?.trim();

  return summaryTrend?.length ? summaryTrend : undefined;
}

function createRootSummary(node: InspectorTreeNode): string | undefined {
  if (node.kind !== "dashboardOverview") {
    return undefined;
  }

  const metricCount =
    node.children?.find((child) => child.title === "核心指标")?.children?.length ?? 0;
  const riskCount =
    node.children?.find((child) => child.title === "风险异常")?.children?.length ?? 0;
  const evidenceCount =
    node.children?.find((child) => child.title === "报告与证据")?.children?.length ?? 0;

  return `${metricCount} 指标 · ${riskCount} 风险 · ${evidenceCount} 证据`;
}

function createMetricOrRiskSecondaryText(node: InspectorTreeNode): string | undefined {
  const trendLabel = extractTrendLabel(node);
  const parts = [node.value, trendLabel].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function createAnalysisContextTreeNodeDisplay(
  activeNodeId: string,
  node: InspectorTreeNode,
  t: Translate
): ContextTreeNodeRowProps {
  const selected = activeNodeId === node.nodeId;

  if (node.kind === "dashboardOverview") {
    return {
      secondaryText: createRootSummary(node),
      selected,
      title: node.title
    };
  }

  if (node.kind === "directory") {
    return {
      count: node.children?.length ?? 0,
      selected,
      title: node.title
    };
  }

  if (node.kind === "metric" || node.kind === "riskSignal") {
    return {
      secondaryText: createMetricOrRiskSecondaryText(node),
      selected,
      title: node.title
    };
  }

  return {
    secondaryText: createContextSourceMetaText(t, node.chips ?? []),
    selected,
    title: node.title
  };
}

export function renderAnalysisContextTreeNodeRow(
  activeNodeId: string,
  node: InspectorTreeNode,
  t: Translate
): ReactNode {
  return <ContextTreeNodeRow {...createAnalysisContextTreeNodeDisplay(activeNodeId, node, t)} />;
}
