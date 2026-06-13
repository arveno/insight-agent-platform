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
  path: string[];
  rootKey: AnalysisInspectorRootKey | null;
};

export function createContextRootNodeId(analysisTaskId: string): string {
  return `inspector-root-context:${analysisTaskId}`;
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
  path: string[]
): InspectorTreeNode | null {
  if (path.length === 0) {
    return null;
  }

  let current: InspectorTreeNode | null = root.nodeId === path[0] ? root : null;

  if (!current) {
    return null;
  }

  for (const nodeId of path.slice(1)) {
    current = current.children?.find((child) => child.nodeId === nodeId) ?? null;

    if (!current) {
      return null;
    }
  }

  return current;
}

export function getInspectorNodeDisplayTitle(node: InspectorTreeNode): string {
  if (node.kind === "directory" && node.children?.length) {
    return `${node.title} · ${node.children.length} 项`;
  }

  return node.title;
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
