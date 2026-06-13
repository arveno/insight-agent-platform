import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { findInspectorTreeNodeById } from "../../../shared/navigation/analysisContextPack";

const dashboardDirectoryNodeIds = {
  metrics: "dashboard-node-directory-metrics",
  platformQuality: "dashboard-node-directory-platform-quality",
  reportEvidence: "dashboard-node-directory-report-evidence",
  riskSummary: "dashboard-node-risk-summary",
  risks: "dashboard-node-directory-risks"
} as const;

function selectDashboardNode(
  root: InspectorTreeNode,
  nodeId: string
): InspectorTreeNode | undefined {
  return findInspectorTreeNodeById(root, nodeId) ?? undefined;
}

function selectDashboardDirectoryChildren(
  root: InspectorTreeNode,
  nodeId: string
): InspectorTreeNode[] {
  return selectDashboardNode(root, nodeId)?.children ?? [];
}

export function selectDashboardMetricSection(root: InspectorTreeNode): InspectorTreeNode | undefined {
  return selectDashboardNode(root, dashboardDirectoryNodeIds.metrics);
}

export function selectDashboardRiskSection(root: InspectorTreeNode): InspectorTreeNode | undefined {
  return selectDashboardNode(root, dashboardDirectoryNodeIds.risks);
}

export function selectDashboardReportEvidenceSection(
  root: InspectorTreeNode
): InspectorTreeNode | undefined {
  return selectDashboardNode(root, dashboardDirectoryNodeIds.reportEvidence);
}

export function selectDashboardQualitySection(root: InspectorTreeNode): InspectorTreeNode | undefined {
  return selectDashboardNode(root, dashboardDirectoryNodeIds.platformQuality);
}

export function selectDashboardMetricNodes(root: InspectorTreeNode): InspectorTreeNode[] {
  return selectDashboardDirectoryChildren(root, dashboardDirectoryNodeIds.metrics);
}

export function selectDashboardRiskSummaryNode(
  root: InspectorTreeNode
): InspectorTreeNode | undefined {
  return selectDashboardNode(root, dashboardDirectoryNodeIds.riskSummary);
}

export function selectDashboardRiskNodes(root: InspectorTreeNode): InspectorTreeNode[] {
  return selectDashboardDirectoryChildren(root, dashboardDirectoryNodeIds.risks).filter(
    (node) => node.nodeId !== dashboardDirectoryNodeIds.riskSummary
  );
}

export function selectDashboardReportNodes(root: InspectorTreeNode): InspectorTreeNode[] {
  return selectDashboardDirectoryChildren(root, dashboardDirectoryNodeIds.reportEvidence).filter(
    (node) => node.kind === "report"
  );
}

export function selectDashboardEvidenceNodes(root: InspectorTreeNode): InspectorTreeNode[] {
  return selectDashboardDirectoryChildren(root, dashboardDirectoryNodeIds.reportEvidence).filter(
    (node) => node.kind === "sourceEvidence"
  );
}

export function selectDashboardQualityNodes(root: InspectorTreeNode): InspectorTreeNode[] {
  return selectDashboardDirectoryChildren(root, dashboardDirectoryNodeIds.platformQuality);
}
