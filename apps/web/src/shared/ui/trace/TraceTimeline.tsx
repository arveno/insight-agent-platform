import type { ReactNode } from "react";
import { Space, Timeline, Typography, theme } from "antd";

import { shellTypographyStyles } from "../../theme";
import { EmptyState, type EmptyStateProps } from "../feedback";
import { RiskBadge, type RiskBadgeProps, StatusTag, type StatusTagProps } from "../status";

export type TraceTimelineItem = {
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

export type TraceTimelineProps = {
  empty?: EmptyStateProps;
  items: TraceTimelineItem[];
};

/**
 * Trace 摘要时间线。
 *
 * 输入必须是标准化 Trace ViewModel；
 * 不展示 LangGraph raw state、Tool raw input/output 或 provider 原始响应。
 */
export function TraceTimeline({ empty, items }: TraceTimelineProps) {
  const { token } = theme.useToken();

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
              background: item.selected ? token.colorFillAlter : "transparent",
              border: `1px solid ${item.selected ? token.colorPrimaryBorder : "transparent"}`,
              borderRadius: token.borderRadiusLG,
              color: token.colorText,
              cursor: "pointer",
              display: "block",
              padding: token.paddingSM,
              textAlign: "left",
              width: "100%"
            }}
            type="button"
          >
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Space wrap>
                <Typography.Text style={shellTypographyStyles.cardTitle}>
                  {item.title}
                </Typography.Text>
                {item.status ? <StatusTag {...item.status} /> : null}
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
          </button>
        ) : (
          <Space direction="vertical" size={4}>
            <Space wrap>
              <Typography.Text style={shellTypographyStyles.cardTitle}>
                {item.title}
              </Typography.Text>
              {item.status ? <StatusTag {...item.status} /> : null}
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
        )
      }))}
    />
  );
}
