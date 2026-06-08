import type { RelationshipGraphViewModel } from "../../../shared/graph/models";
import { RelationshipGraphCanvas } from "../../../shared/graph/RelationshipGraphCanvas";

export type AssetRelationshipGraphProps = {
  graph: RelationshipGraphViewModel;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string;
};

export function AssetRelationshipGraph({
  graph,
  onSelectNode,
  selectedNodeId
}: AssetRelationshipGraphProps) {
  return (
    <RelationshipGraphCanvas
      graph={graph}
      onSelectNode={onSelectNode}
      selectedNodeId={selectedNodeId}
    />
  );
}
