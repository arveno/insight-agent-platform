export type RelationshipGraphNodeKind =
  | "asset"
  | "table"
  | "field"
  | "document"
  | "chunk_group"
  | "chunk"
  | "evidence"
  | "usage"
  | "empty";

export type RelationshipGraphNodeViewModel = {
  description?: string;
  kind: RelationshipGraphNodeKind;
  label: string;
  nodeId: string;
  riskText?: string;
  statusText?: string;
};

export type RelationshipGraphEdgeViewModel = {
  edgeId: string;
  label?: string;
  sourceNodeId: string;
  targetNodeId: string;
};

export type RelationshipGraphViewModel = {
  description?: string;
  edges: RelationshipGraphEdgeViewModel[];
  nodes: RelationshipGraphNodeViewModel[];
  selectedNodeId?: string;
  title: string;
};
