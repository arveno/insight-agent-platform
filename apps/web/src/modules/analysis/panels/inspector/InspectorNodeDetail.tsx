import { Button, Space, Tag, Typography } from "antd";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { CardSurface } from "../../../../shared/ui/surfaces/CardSurface";
import { buildInspectorNodePresentation } from "./buildInspectorNodePresentation";
import { InspectorNodeCard } from "./InspectorNodeCard";

export type InspectorNodeDetailProps = {
  ancestors?: InspectorTreeNode[];
  node: InspectorTreeNode;
  onBack: () => void;
  onSelectChild: (nodeId: string) => void;
  showBack: boolean;
};

function renderChipList(chips: string[]) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <Space size={[8, 8]} wrap>
      {chips.map((chip) => (
        <Tag key={chip}>{chip}</Tag>
      ))}
    </Space>
  );
}

export function InspectorNodeDetail({
  ancestors = [],
  node,
  onBack,
  onSelectChild,
  showBack
}: InspectorNodeDetailProps) {
  const presentation = buildInspectorNodePresentation(node, ancestors);

  if (presentation.hasChildren) {
    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {showBack ? (
          <Button onClick={onBack} type="default">
            返回上一级
          </Button>
        ) : null}
        {renderChipList(presentation.chips)}
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {node.children?.map((child) => (
            <InspectorNodeCard
              key={child.nodeId}
              onClick={() => onSelectChild(child.nodeId)}
              presentation={buildInspectorNodePresentation(child, [...ancestors, node])}
              showChildCount={child.kind === "directory"}
            />
          ))}
        </Space>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      {showBack ? (
        <Button onClick={onBack} type="default">
          返回上一级
        </Button>
      ) : null}
      <CardSurface>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {presentation.eyebrow ? (
            <Typography.Text type="secondary">{presentation.eyebrow}</Typography.Text>
          ) : null}
          {presentation.value ? <Typography.Text>{presentation.value}</Typography.Text> : null}
          {renderChipList(presentation.chips)}
          {presentation.disabledReason ? (
            <Typography.Text type="secondary">{presentation.disabledReason}</Typography.Text>
          ) : null}
        </Space>
      </CardSurface>
    </Space>
  );
}
