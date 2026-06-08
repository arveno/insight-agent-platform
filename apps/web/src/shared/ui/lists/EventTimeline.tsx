import type { CSSProperties, ReactNode } from "react";
import { Space, Timeline, Typography, theme } from "antd";

import { shellTypographyStyles } from "../../theme/typography";
import { EmptyState } from "../states/EmptyState";
import type { EmptyStateProps } from "../states/EmptyState";
import { RiskBadge } from "../status/RiskBadge";
import type { RiskBadgeProps } from "../status/RiskBadge";
import type { StatusTagProps } from "../status/StatusTag";

export type EventTimelineItem = {
  ariaLabel?: string;
  description?: ReactNode;
  key: string;
  onClick?: () => void;
  risk?: RiskBadgeProps;
  selected?: boolean;
  status?: StatusTagProps;
  timestampText?: string;
  title: ReactNode;
};

export type EventTimelineProps = {
  empty?: EmptyStateProps;
  items: EventTimelineItem[];
};

export function EventTimeline({ empty, items }: EventTimelineProps) {
  const { token } = theme.useToken();
  const itemContainerStyle: CSSProperties = {
    border: "1px solid transparent",
    borderRadius: token.borderRadiusLG,
    color: token.colorText,
    display: "block",
    minHeight: 76,
    padding: token.paddingSM,
    textAlign: "left",
    width: "100%"
  };

  if (items.length === 0) {
    return <EmptyState {...empty} />;
  }

  return (
    <Timeline
      items={items.map((item) => ({
        children: item.onClick ? (
          <button
            aria-label={item.ariaLabel}
            aria-pressed={item.selected}
            onClick={item.onClick}
            style={{
              ...itemContainerStyle,
              background: item.selected ? token.colorFillAlter : "transparent",
              borderColor: item.selected ? token.colorPrimaryBorder : "transparent",
              cursor: "pointer"
            }}
            type="button"
          >
            <EventTimelineContent item={item} />
          </button>
        ) : (
          <div
            style={{
              ...itemContainerStyle,
              background: "transparent"
            }}
          >
            <EventTimelineContent item={item} />
          </div>
        ),
        dot: <EventStatusDot status={item.status} />
      }))}
    />
  );
}

function EventTimelineContent({ item }: { item: EventTimelineItem }) {
  return (
    <Space direction="vertical" size={4} style={{ width: "100%" }}>
      <Space wrap>
        <Typography.Text style={shellTypographyStyles.cardTitle}>{item.title}</Typography.Text>
        {item.risk ? <RiskBadge {...item.risk} /> : null}
        {item.timestampText ? (
          <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
            {item.timestampText}
          </Typography.Text>
        ) : null}
      </Space>
      {item.description ? (
        <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
          {item.description}
        </Typography.Text>
      ) : null}
    </Space>
  );
}

function EventStatusDot({ status }: { status?: StatusTagProps }) {
  const { token } = theme.useToken();
  const backgroundColor = getEventStatusDotColor(status?.tone, token);
  const tone = status?.tone ?? "default";

  return (
    <span
      aria-hidden="true"
      data-event-status-dot={tone}
      style={{
        backgroundColor,
        border: `1px solid ${backgroundColor}`,
        borderRadius: "50%",
        display: "inline-block",
        height: 8,
        transform: "translateY(2px)",
        width: 8
      }}
    />
  );
}

function getEventStatusDotColor(
  tone: StatusTagProps["tone"] | undefined,
  token: ReturnType<typeof theme.useToken>["token"]
) {
  switch (tone) {
    case "success":
      return token.colorSuccess;
    case "processing":
      return token.colorInfo;
    case "warning":
      return token.colorWarning;
    case "error":
      return token.colorError;
    case "default":
    default:
      return token.colorTextQuaternary;
  }
}
