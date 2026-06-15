import type { ReactNode } from "react";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { ContextTreeNodeRow, type ContextTreeNodeRowProps } from "../../../../shared/ui/lists/ContextTreeNodeRow";
import { RiskBadge } from "../../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../../shared/ui/status/StatusTag";

const sourceTypeChipLabels: Record<string, string> = {
  dataTable: "数据表",
  knowledgeDocument: "知识文档",
  report: "报告",
  sourceEvidence: "证据"
};

const sourceRoleChipLabels: Record<string, string> = {
  primary_table: "主表",
  supporting_document: "支撑文档",
  supporting_evidence: "支撑证据",
  supporting_report: "支撑报告"
};

const riskChipLabels: Record<string, { label: string; level: "low" | "medium" | "high" | "critical" }> = {
  low: {
    label: "低风险",
    level: "low"
  },
  medium: {
    label: "中风险",
    level: "medium"
  },
  high: {
    label: "高风险",
    level: "high"
  },
  critical: {
    label: "严重风险",
    level: "critical"
  }
};

const statusChipLabels: Record<string, { label: string; tone: "success" | "warning" }> = {
  attention: {
    label: "关注",
    tone: "warning"
  },
  healthy: {
    label: "健康",
    tone: "success"
  }
};

function dedupeValues(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim().length > 0)))];
}

function normalizeChipLabel(chip: string): string | null {
  const trimmed = chip.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (sourceTypeChipLabels[trimmed]) {
    return sourceTypeChipLabels[trimmed];
  }

  if (sourceRoleChipLabels[trimmed]) {
    return sourceRoleChipLabels[trimmed];
  }

  const riskMatch = trimmed.match(/^风险\s+(low|medium|high|critical)$/);

  if (riskMatch) {
    return riskChipLabels[riskMatch[1] ?? ""]?.label ?? null;
  }

  return statusChipLabels[trimmed]?.label ?? trimmed;
}

function extractTrendLabel(node: InspectorTreeNode, chips: string[]): string | undefined {
  const chipTrend = chips.find((chip) => /^(上升|下降|持平)\s+/.test(chip));

  if (chipTrend) {
    return chipTrend;
  }

  const summaryTrend = node.summary?.match(/趋势\s*([^，。]+)/)?.[1]?.trim();

  return summaryTrend?.length ? summaryTrend : undefined;
}

function extractStatusLabel(chips: string[]): string | undefined {
  return chips.find((chip) => chip === "关注" || chip === "健康");
}

function extractRiskLabel(chips: string[]): string | undefined {
  return chips.find((chip) =>
    chip === "低风险" || chip === "中风险" || chip === "高风险" || chip === "严重风险"
  );
}

function extractSourceTypeLabel(node: InspectorTreeNode): string | undefined {
  for (const chip of node.chips ?? []) {
    const label = sourceTypeChipLabels[chip];

    if (label) {
      return label;
    }
  }

  return undefined;
}

function extractSourceRoleLabel(node: InspectorTreeNode): string | undefined {
  for (const chip of node.chips ?? []) {
    const label = sourceRoleChipLabels[chip];

    if (label) {
      return label;
    }
  }

  return undefined;
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

function createBadges(chips: string[]): ReactNode {
  const statusLabel = extractStatusLabel(chips);
  const riskLabel = extractRiskLabel(chips);

  if (!statusLabel && !riskLabel) {
    return null;
  }

  return (
    <>
      {statusLabel ? (
        <StatusTag label={statusLabel} tone={statusChipLabels[statusLabel === "关注" ? "attention" : "healthy"]?.tone ?? "success"} />
      ) : null}
      {riskLabel ? (
        <RiskBadge
          label={riskLabel}
          level={
            riskLabel === "低风险"
              ? "low"
              : riskLabel === "中风险"
                ? "medium"
                : riskLabel === "高风险"
                  ? "high"
                  : "critical"
          }
        />
      ) : null}
    </>
  );
}

function createMetricOrRiskSecondaryText(node: InspectorTreeNode, chips: string[]): string | undefined {
  const trendLabel = extractTrendLabel(node, chips);
  const parts = [node.value, trendLabel].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function createLeafSecondaryText(node: InspectorTreeNode, chips: string[]): string | undefined {
  const sourceTypeLabel = extractSourceTypeLabel(node);
  const sourceRoleLabel = extractSourceRoleLabel(node);
  const filteredChips = chips.filter((chip) => {
    if (
      chip === node.timeRange?.label ||
      /^(上升|下降|持平)\s+/.test(chip) ||
      chip === "关注" ||
      chip === "健康" ||
      chip === "低风险" ||
      chip === "中风险" ||
      chip === "高风险" ||
      chip === "严重风险"
    ) {
      return false;
    }

    if (chip === sourceTypeLabel || chip === sourceRoleLabel) {
      return false;
    }

    return true;
  });

  const orderedChips = [
    sourceTypeLabel,
    sourceRoleLabel,
    ...filteredChips
  ].filter((chip): chip is string => Boolean(chip));

  return orderedChips.length > 0 ? orderedChips.join(" · ") : undefined;
}

export function createAnalysisContextTreeNodeDisplay(
  activeNodeId: string,
  node: InspectorTreeNode
): ContextTreeNodeRowProps {
  const normalizedChips = dedupeValues((node.chips ?? []).map((chip) => normalizeChipLabel(chip)));
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
      badges: createBadges(normalizedChips),
      secondaryText: createMetricOrRiskSecondaryText(node, normalizedChips),
      selected,
      title: node.title
    };
  }

  return {
    badges: createBadges(normalizedChips),
    secondaryText: createLeafSecondaryText(node, normalizedChips),
    selected,
    title: node.title
  };
}

export function renderAnalysisContextTreeNodeRow(
  activeNodeId: string,
  node: InspectorTreeNode
): ReactNode {
  return <ContextTreeNodeRow {...createAnalysisContextTreeNodeDisplay(activeNodeId, node)} />;
}
