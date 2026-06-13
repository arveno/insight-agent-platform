import { Space } from "antd";

import type { AnalysisInspectorRoot } from "../../models/inspectorTree";
import { buildInspectorNodePresentation } from "./buildInspectorNodePresentation";
import { InspectorNodeCard } from "./InspectorNodeCard";

export type InspectorRootPanelProps = {
  onSelectRoot: (rootKey: AnalysisInspectorRoot["key"]) => void;
  roots: AnalysisInspectorRoot[];
};

export function InspectorRootPanel({ onSelectRoot, roots }: InspectorRootPanelProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {roots.map((root) => (
        <InspectorNodeCard
          key={root.key}
          onClick={() => onSelectRoot(root.key)}
          presentation={buildInspectorNodePresentation(root.tree)}
        />
      ))}
    </Space>
  );
}
