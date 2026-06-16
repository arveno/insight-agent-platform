import type {
  InspectorOwnerRef,
  InspectorTreeNode
} from "@insight-agent/contracts/generated/typescript";

export type AnalysisInspectorRootKey =
  | "context"
  | "run-trace"
  | "run-history"
  | "runtime-references"
  | "reports"
  | "evidence"
  | "decisions"
  | "tool-calls"
  | "model-calls";

export type AnalysisInspectorRoot = {
  key: AnalysisInspectorRootKey;
  description?: string;
  owner: InspectorOwnerRef;
  title: string;
  tree: InspectorTreeNode;
};

export type AnalysisInspectorTreeState = {
  expandedNodeIds: string[];
  selectedNodeId: string | null;
};

export function createEmptyInspectorTreeState(): AnalysisInspectorTreeState {
  return {
    expandedNodeIds: [],
    selectedNodeId: null
  };
}

export function createRunTraceRootNodeId(runId: string): string {
  return `inspector-root-run-trace:${runId}`;
}

export function createRunHistoryRootNodeId(analysisTaskId: string): string {
  return `inspector-root-run-history:${analysisTaskId}`;
}

export function createReportsRootNodeId(runId: string): string {
  return `inspector-root-reports:${runId}`;
}

export function createEvidenceRootNodeId(runId: string): string {
  return `inspector-root-evidence:${runId}`;
}

export function createDecisionsRootNodeId(runId: string): string {
  return `inspector-root-decisions:${runId}`;
}

export function createToolCallsRootNodeId(runId: string): string {
  return `inspector-root-tool-calls:${runId}`;
}

export function createModelCallsRootNodeId(runId: string): string {
  return `inspector-root-model-calls:${runId}`;
}

export function findInspectorTreeNode(
  root: InspectorTreeNode,
  nodeId: string
): InspectorTreeNode | null {
  if (root.nodeId === nodeId) {
    return root;
  }

  for (const child of root.children ?? []) {
    const match = findInspectorTreeNode(child, nodeId);

    if (match) {
      return match;
    }
  }

  return null;
}

export function findInspectorTreePathNodes(
  root: InspectorTreeNode,
  nodeId: string
): InspectorTreeNode[] | null {
  if (root.nodeId === nodeId) {
    return [root];
  }

  for (const child of root.children ?? []) {
    const childPath = findInspectorTreePathNodes(child, nodeId);

    if (childPath) {
      return [root, ...childPath];
    }
  }

  return null;
}

export function getInspectorNodeEyebrow(node: InspectorTreeNode): string | undefined {
  switch (node.kind) {
    case "analysisRun":
      return "运行记录";
    case "decision":
      return "决策";
    case "metric":
      return "指标";
    case "modelCall":
      return "模型调用";
    case "platformQuality":
      return "平台质量";
    case "report":
      return "报告";
    case "reportSection":
      return "报告章节";
    case "riskSignal":
      return "风险信号";
    case "riskSummary":
      return "风险摘要";
    case "sourceEvidence":
      return "证据";
    case "toolCall":
      return "工具调用";
    case "traceEvent":
      return "运行轨迹";
    default:
      return undefined;
  }
}

export function getInspectorNodeStatusText(node: InspectorTreeNode): string | null {
  if (node.disabledReason) {
    return node.disabledReason;
  }

  if (!node.children?.length && !node.sourceRef) {
    return "仅摘要";
  }

  return null;
}
