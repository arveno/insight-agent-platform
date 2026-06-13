import { Button, Space, Tag, Typography } from "antd";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { ContentCard } from "../../../../shared/ui/cards/ContentCard";
import { CardSurface } from "../../../../shared/ui/surfaces/CardSurface";
import {
  getInspectorNodeDisplayTitle,
  getInspectorNodeEyebrow,
  getInspectorNodeStatusText
} from "../../models/inspectorTree";
import { getInspectorDisplayTags } from "./inspectorDisplayTags";

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
  const statusText = getInspectorNodeStatusText(node);
  const hasChildren = Boolean(node.children?.length);
  const nodeDescription = node.summary ?? node.description;
  const nodeEyebrow = getInspectorNodeEyebrow(node);
  const nodeTags = getInspectorDisplayTags(node);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {hasChildren ? (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {nodeTags.length ? (
            <Space size={[8, 8]} wrap>
              {nodeTags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          ) : null}
          {showBack ? (
            <Button onClick={onBack} type="default">
              返回上一级
            </Button>
          ) : null}
        </Space>
      ) : (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {showBack ? (
            <Button onClick={onBack} type="default">
              返回上一级
            </Button>
          ) : null}
          <CardSurface>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              {nodeEyebrow ? (
                <Typography.Text type="secondary">{nodeEyebrow}</Typography.Text>
              ) : null}
              {node.value ? <Typography.Text>{node.value}</Typography.Text> : null}
              {nodeDescription ? (
                <Typography.Text type="secondary">{nodeDescription}</Typography.Text>
              ) : null}
              {nodeTags.length ? (
                <Space size={[8, 8]} wrap>
                  {nodeTags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              ) : null}
              {statusText ? (
                <Typography.Text type="secondary">{statusText}</Typography.Text>
              ) : null}
            </Space>
          </CardSurface>
        </Space>
      )}

      {hasChildren ? (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {node.children!.map((child) => (
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
                description={
                  child.summary ?? child.description ?? getInspectorNodeStatusText(child) ?? undefined
                }
                eyebrow={getInspectorNodeEyebrow(child)}
                title={getInspectorNodeDisplayTitle(child)}
              >
                {child.value ? (
                  <Typography.Text>{child.value}</Typography.Text>
                ) : child.chips?.length ? (
                  <Typography.Text type="secondary">{child.chips.join(" / ")}</Typography.Text>
                ) : getInspectorNodeStatusText(child) ? (
                  <Typography.Text type="secondary">
                    {getInspectorNodeStatusText(child)}
                  </Typography.Text>
                ) : null}
              </ContentCard>
            </button>
          ))}
        </Space>
      ) : null}
    </Space>
  );
}
