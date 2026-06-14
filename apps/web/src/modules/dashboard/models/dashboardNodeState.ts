import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import type { RiskBadgeProps } from "../../../shared/ui/status/RiskBadge";
import type { StatusTagProps } from "../../../shared/ui/status/StatusTag";
import {
  formatRiskLevelLabel,
  formatSourceTypeLabel,
  formatStatusLabel,
  parseRiskLevel,
  toRiskBadgeFromLevel,
  toStatusTagFromStatus
} from "../../../shared/utils/viewModelState";

const trendLabelPattern = /^(上升|下降|持平)\s+/;
const dashboardStatusValues = new Set(["attention", "healthy"]);
const dashboardCountChipPattern = /^[0-9]+\s*(项关注|条证据)$/;

function normalizeStatusValue(value?: string): string | undefined {
  const normalizedValue = value?.trim().toLowerCase();

  if (!normalizedValue || !dashboardStatusValues.has(normalizedValue)) {
    return undefined;
  }

  return normalizedValue;
}

function nodeChips(node: InspectorTreeNode): string[] {
  return node.chips ?? [];
}

export function getDashboardNodeTrendLabel(node: InspectorTreeNode): string | undefined {
  return nodeChips(node).find((chip) => trendLabelPattern.test(chip));
}

export function getDashboardNodeRiskLevel(node: InspectorTreeNode) {
  return [node.description, node.value, node.summary, ...nodeChips(node)]
    .map((value) => parseRiskLevel(value))
    .find((level) => Boolean(level));
}

export function getDashboardNodeRiskLabel(node: InspectorTreeNode): string | undefined {
  const riskLevel = getDashboardNodeRiskLevel(node);

  return riskLevel ? formatRiskLevelLabel(riskLevel) : undefined;
}

export function getDashboardNodeRiskBadge(
  node: InspectorTreeNode,
  reason = node.summary
): RiskBadgeProps | undefined {
  const riskLevel = getDashboardNodeRiskLevel(node);

  return riskLevel ? toRiskBadgeFromLevel(riskLevel, reason) : undefined;
}

export function getDashboardNodeStatusValue(node: InspectorTreeNode): string | undefined {
  return [node.description, ...nodeChips(node)]
    .map((value) => normalizeStatusValue(value))
    .find((value) => Boolean(value));
}

export function getDashboardNodeStatusLabel(node: InspectorTreeNode): string | undefined {
  const statusValue = getDashboardNodeStatusValue(node);

  return statusValue ? formatStatusLabel(statusValue) : undefined;
}

export function getDashboardNodeStatusTag(node: InspectorTreeNode): StatusTagProps | undefined {
  return toStatusTagFromStatus(getDashboardNodeStatusValue(node));
}

export function getDashboardNodeSourceTypeLabel(node: InspectorTreeNode): string | undefined {
  return formatSourceTypeLabel(node.sourceRef?.type);
}

export function getDashboardNodeKindLabel(node: InspectorTreeNode): string {
  return formatSourceTypeLabel(node.kind) ?? node.kind;
}

export function getDashboardNodeContextLabel(node: InspectorTreeNode): string | undefined {
  return nodeChips(node).find((chip) => {
    if (trendLabelPattern.test(chip)) {
      return false;
    }

    if (dashboardCountChipPattern.test(chip)) {
      return false;
    }

    if (normalizeStatusValue(chip)) {
      return false;
    }

    if (parseRiskLevel(chip)) {
      return false;
    }

    return true;
  });
}
