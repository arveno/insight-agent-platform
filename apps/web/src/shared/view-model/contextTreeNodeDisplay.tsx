import type { ReactNode } from "react";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import type { Translate } from "../i18n/translateKey";
import {
  ContextTreeNodeRow,
  type ContextTreeNodeRowProps
} from "../ui/lists/ContextTreeNodeRow";
import { createContextSourceMetaText } from "./contextSourceDisplay";

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

  let metricCount = 0;
  let riskCount = 0;
  let evidenceCount = 0;

  for (const section of node.children ?? []) {
    const kinds = (section.children ?? []).map((child) => child.kind);

    if (kinds.length === 0) {
      continue;
    }

    if (kinds.every((kind) => kind === "metric")) {
      metricCount = section.children?.length ?? 0;
      continue;
    }

    if (kinds.every((kind) => kind === "riskSignal")) {
      riskCount = section.children?.length ?? 0;
      continue;
    }

    if (kinds.every((kind) => kind === "report" || kind === "sourceEvidence")) {
      evidenceCount = section.children?.length ?? 0;
    }
  }

  return `${metricCount} 指标 · ${riskCount} 风险 · ${evidenceCount} 证据`;
}

function createMetricOrRiskSecondaryText(node: InspectorTreeNode): string | undefined {
  const trendLabel = extractTrendLabel(node);
  const parts = [node.value, trendLabel].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

/**
 * Shared Pattern：把 InspectorTreeNode 规范化为 ContextTreeNodeRowProps。
 *
 * 只依赖共享 contract 字段，不识别 dashboard / analysis 模块，不处理路由、
 * SourceRef detail，也不从 chips 反推风险或状态 badge。
 */
export function createContextTreeNodeDisplay(args: {
  activeNodeId: string;
  node: InspectorTreeNode;
  t: Translate;
}): ContextTreeNodeRowProps {
  const { activeNodeId, node, t } = args;
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

/**
 * Shared Pattern：统一渲染 Context Tree / List row。
 *
 * Dashboard 与 Analysis 必须共用这层展示映射，保证同一棵 InspectorTreeNode
 * 在不同页面得到一致的 row 渲染结果。
 */
export function renderContextTreeNodeRow(args: {
  activeNodeId: string;
  node: InspectorTreeNode;
  t: Translate;
}): ReactNode {
  return <ContextTreeNodeRow {...createContextTreeNodeDisplay(args)} />;
}
