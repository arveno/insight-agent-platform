import { Button, Space, Tag, Typography } from "antd";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { ContentCard } from "../../../../shared/ui/cards/ContentCard";
import { formatSourceRef } from "../../models/inspectorTree";

export type InspectorTreeNodePanelProps = {
  node: InspectorTreeNode;
  onBack: () => void;
  onSelectChild: (nodeId: string) => void;
  showBack: boolean;
};

export function InspectorTreeNodePanel({
  node,
  onBack,
  onSelectChild,
  showBack
}: InspectorTreeNodePanelProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {showBack ? (
        <Button onClick={onBack} type="default">
          返回上一级
        </Button>
      ) : null}

      <ContentCard
        description={node.summary ?? node.description}
        eyebrow={node.kind}
        title={node.title}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {node.value ? <Typography.Text>{node.value}</Typography.Text> : null}
          {node.timeRange ? (
            <Typography.Text type="secondary">{node.timeRange.label}</Typography.Text>
          ) : null}
          {node.chips?.length ? (
            <Space size={[8, 8]} wrap>
              {node.chips.map((chip) => (
                <Tag key={chip}>{chip}</Tag>
              ))}
            </Space>
          ) : null}
          {formatSourceRef(node.sourceRef) ? (
            <Typography.Text type="secondary">{formatSourceRef(node.sourceRef)}</Typography.Text>
          ) : null}
          {node.disabledReason ? (
            <Typography.Text type="secondary">{node.disabledReason}</Typography.Text>
          ) : null}
        </Space>
      </ContentCard>

      {node.children?.length ? (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {node.children.map((child) => (
            <button
              key={child.nodeId}
              onClick={() => onSelectChild(child.nodeId)}
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
              <ContentCard
                description={child.summary ?? child.description}
                eyebrow={child.kind}
                title={child.title}
              >
                {child.value ? (
                  <Typography.Text>{child.value}</Typography.Text>
                ) : child.chips?.length ? (
                  <Typography.Text type="secondary">{child.chips.join(" / ")}</Typography.Text>
                ) : null}
              </ContentCard>
            </button>
          ))}
        </Space>
      ) : null}
    </Space>
  );
}
