import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { InspectorNodeDetail } from "./InspectorNodeDetail";

export type InspectorTreeNodePanelProps = {
  ancestors?: InspectorTreeNode[];
  node: InspectorTreeNode;
  onBack: () => void;
  onSelectChild: (nodeId: string) => void;
  showBack: boolean;
};

export function InspectorTreeNodePanel(props: InspectorTreeNodePanelProps) {
  return <InspectorNodeDetail {...props} />;
}
