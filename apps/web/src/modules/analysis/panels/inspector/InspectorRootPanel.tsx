import { Space } from "antd";

import { ContentCard } from "../../../../shared/ui/cards/ContentCard";
import type { AnalysisInspectorRoot } from "../../models/inspectorTree";

export type InspectorRootPanelProps = {
  onSelectRoot: (rootKey: AnalysisInspectorRoot["key"]) => void;
  roots: AnalysisInspectorRoot[];
};

export function InspectorRootPanel({ onSelectRoot, roots }: InspectorRootPanelProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {roots.map((root) => (
        <button
          key={root.key}
          onClick={() => onSelectRoot(root.key)}
          style={{
            background: "transparent",
            border: 0,
            cursor: "pointer",
            display: "block",
            padding: 0,
            textAlign: "left",
            width: "100%"
          }}
          type="button"
        >
          <ContentCard description={root.description ?? root.tree.summary} title={root.title} />
        </button>
      ))}
    </Space>
  );
}
