import type {
  AnalysisTaskContextPack,
  InspectorOwnerRef,
  InspectorTreeNode
} from "@insight-agent/contracts/generated/typescript";

export function createDraftAnalysisTaskOwnerRef(): InspectorOwnerRef {
  return { type: "analysisTask" };
}

export function cloneInspectorTreeNode(node: InspectorTreeNode): InspectorTreeNode {
  return {
    ...node,
    chips: node.chips ? [...node.chips] : undefined,
    children: node.children?.map((child) => cloneInspectorTreeNode(child)),
    owner: { ...node.owner },
    sourceRef: node.sourceRef ? { ...node.sourceRef } : undefined,
    timeRange: node.timeRange ? { ...node.timeRange } : undefined
  };
}

export function findInspectorTreeNodeById(
  root: InspectorTreeNode,
  nodeId: string
): InspectorTreeNode | null {
  if (root.nodeId === nodeId) {
    return root;
  }

  for (const child of root.children ?? []) {
    const match = findInspectorTreeNodeById(child, nodeId);

    if (match) {
      return match;
    }
  }

  return null;
}

export function createAnalysisContextPackFromTree(args: {
  capturedAt: string;
  root: InspectorTreeNode;
  suggestedPrompt: string;
  traceability?: AnalysisTaskContextPack["traceability"];
}): AnalysisTaskContextPack {
  return {
    capturedAt: args.capturedAt,
    root: cloneInspectorTreeNode(args.root),
    suggestedPrompt: args.suggestedPrompt,
    traceability: args.traceability ?? "direct_refs",
    version: 1
  };
}
