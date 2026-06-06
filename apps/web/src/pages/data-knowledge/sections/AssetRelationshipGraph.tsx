import { Space, Typography, theme } from "antd";

import type { DataKnowledgeRelationshipGraphViewModel } from "../../../features/data-knowledge/models";
import { shellThemeTokens, shellTypographyStyles } from "../../../shared";

export type AssetRelationshipGraphProps = {
  graph: DataKnowledgeRelationshipGraphViewModel;
  onSelectNode: (key: string) => void;
  selectedNodeKey: string;
};

export function AssetRelationshipGraph({
  graph,
  onSelectNode,
  selectedNodeKey
}: AssetRelationshipGraphProps) {
  const { token } = theme.useToken();

  return (
    <Space direction="vertical" size={shellThemeTokens.shellSectionGap} style={{ width: "100%" }}>
      <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
        {graph.description}
      </Typography.Text>

      <div style={{ overflowX: "auto", width: "100%" }}>
        <div
          style={{
            display: "grid",
            gap: token.margin,
            gridTemplateColumns: `repeat(${graph.columns.length}, minmax(180px, 1fr))`,
            minWidth: graph.columns.length * 180
          }}
        >
          {graph.columns.map((column) => (
            <div
              key={column.key}
              style={{
                border: `${shellThemeTokens.surfaceBorderWidth}px solid ${token.colorBorderSecondary}`,
                borderRadius: shellThemeTokens.borderRadiusLG,
                padding: token.paddingSM
              }}
            >
              <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
                <Typography.Text style={shellTypographyStyles.cardTitle}>
                  {column.title}
                </Typography.Text>

                {column.nodes.map((node) => {
                  const isSelected = selectedNodeKey === node.key;

                  return (
                    <button
                      aria-label={node.title}
                      key={node.key}
                      onClick={() => onSelectNode(node.key)}
                      style={{
                        appearance: "none",
                        background: isSelected ? token.colorFillSecondary : token.colorBgElevated,
                        border: `${shellThemeTokens.surfaceBorderWidth}px solid ${
                          isSelected ? token.colorPrimaryBorder : token.colorBorderSecondary
                        }`,
                        borderRadius: shellThemeTokens.borderRadius,
                        color: token.colorText,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        padding: token.paddingSM,
                        textAlign: "left",
                        width: "100%"
                      }}
                      type="button"
                    >
                      <Typography.Text style={shellTypographyStyles.cardTitle}>
                        {node.title}
                      </Typography.Text>
                      <Typography.Text
                        ellipsis={{ tooltip: node.summary }}
                        type="secondary"
                        style={shellTypographyStyles.meta}
                      >
                        {node.summary}
                      </Typography.Text>
                    </button>
                  );
                })}
              </Space>
            </div>
          ))}
        </div>
      </div>
    </Space>
  );
}
