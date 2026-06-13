import type {
  InspectorTreeNode,
  SourceRef
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

export function formatSourceRef(sourceRef?: SourceRef): string | null {
  if (!sourceRef) {
    return null;
  }

  switch (sourceRef.type) {
    case "analysisRun":
      return `runId: ${sourceRef.runId}`;
    case "dataTable":
      return `tableId: ${sourceRef.tableId}`;
    case "job":
      return `jobId: ${sourceRef.jobId}`;
    case "knowledgeDocument":
      return `knowledgeDocumentId: ${sourceRef.knowledgeDocumentId}`;
    case "metric":
      return `metricId: ${sourceRef.metricId}`;
    case "modelCall":
      return `modelCallId: ${sourceRef.modelCallId}`;
    case "report":
      return `reportId: ${sourceRef.reportId}`;
    case "sourceEvidence":
      return `sourceEvidenceId: ${sourceRef.sourceEvidenceId}`;
    case "toolCall":
      return `toolCallId: ${sourceRef.toolCallId}`;
  }
}
