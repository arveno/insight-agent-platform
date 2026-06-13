import { Space, Tag, Typography } from "antd";

import { ContentCard } from "../../../../shared/ui/cards/ContentCard";
import {
  type InspectorNodePresentation,
  getInspectorPresentationTitle
} from "./buildInspectorNodePresentation";

export type InspectorNodeCardProps = {
  onClick?: () => void;
  presentation: InspectorNodePresentation;
  showChildCount?: boolean;
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

function renderCardBody(presentation: InspectorNodePresentation) {
  const hasBody =
    Boolean(presentation.value) ||
    Boolean(presentation.description) ||
    presentation.chips.length > 0 ||
    Boolean(presentation.disabledReason);

  if (!hasBody) {
    return null;
  }

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      {presentation.value ? <Typography.Text>{presentation.value}</Typography.Text> : null}
      {presentation.description ? (
        <Typography.Text type="secondary">{presentation.description}</Typography.Text>
      ) : null}
      {renderChipList(presentation.chips)}
      {presentation.disabledReason ? (
        <Typography.Text type="secondary">{presentation.disabledReason}</Typography.Text>
      ) : null}
    </Space>
  );
}

export function InspectorNodeCard({
  onClick,
  presentation,
  showChildCount = false
}: InspectorNodeCardProps) {
  const card = (
    <ContentCard
      eyebrow={presentation.eyebrow}
      title={getInspectorPresentationTitle(presentation, { includeChildCount: showChildCount })}
    >
      {renderCardBody(presentation)}
    </ContentCard>
  );

  if (!onClick) {
    return card;
  }

  return (
    <button
      onClick={onClick}
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
      {card}
    </button>
  );
}
