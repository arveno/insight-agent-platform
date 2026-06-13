import { Space, Tag } from "antd";

import { ContentCard } from "../../../../shared/ui/cards/ContentCard";
import type { AnalysisInspectorRoot } from "../../models/inspectorTree";
import { getInspectorDisplayTags } from "./inspectorDisplayTags";

export type InspectorRootPanelProps = {
  onSelectRoot: (rootKey: AnalysisInspectorRoot["key"]) => void;
  roots: AnalysisInspectorRoot[];
};

export function InspectorRootPanel({ onSelectRoot, roots }: InspectorRootPanelProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {roots.map((root) => {
        const tags = getInspectorDisplayTags(root.tree);

        return (
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
            <ContentCard description={root.description ?? root.tree.summary} title={root.title}>
              {tags.length > 0 ? (
                <Space size={[8, 8]} wrap>
                  {tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              ) : null}
            </ContentCard>
          </button>
        );
      })}
    </Space>
  );
}
