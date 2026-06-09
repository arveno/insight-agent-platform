import type { CSSProperties, ReactNode } from "react";
import { Space, Timeline, Typography, theme } from "antd";

import { shellTypographyStyles } from "../../theme/typography";
import { EmptyState } from "../states/EmptyState";
import type { EmptyStateProps } from "../states/EmptyState";
import { RiskBadge } from "../status/RiskBadge";
import type { RiskBadgeProps } from "../status/RiskBadge";
import type { StatusTagProps } from "../status/StatusTag";

/**
 * Shared Pattern：EventTimeline 的通用 item contract。
 *
 * 用于时间线式事件展示，不包含 RunTrace、TraceEvent 或其它业务对象本身。
 * 各模块必须先把业务数据映射成 title、description、timestampText、status 和 risk 等通用字段。
 */
export type EventTimelineItem = {
  ariaLabel?: string;
  description?: ReactNode;
  key: string;
  /** 点击回调只表达“查看该事件”，不承接 route 映射或业务判断。 */
  onClick?: () => void;
  risk?: RiskBadgeProps;
  /** 纯展示选中态，不等同于业务生命周期状态。 */
  selected?: boolean;
  status?: StatusTagProps;
  /** 已格式化的时间文本；组件不负责时间解析或格式化。 */
  timestampText?: string;
  title: ReactNode;
};

/**
 * Shared Pattern：EventTimeline 的公共 props 契约。
 *
 * empty 用于空态展示，items 必须是已经去业务化的事件项。
 * 组件不解析 raw trace data，也不做排序或过滤。
 */
export type EventTimelineProps = {
  empty?: EmptyStateProps;
  items: EventTimelineItem[];
};

/**
 * Shared Pattern：通用事件时间线。
 *
 * 基于 Ant Timeline 和 shared status/risk primitives，
 * 只负责稳定展示事件标题、描述、时间、状态点和风险信息。
 * 不消费业务 trace 对象，不做 route 映射、排序或权限判断。
 */
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
