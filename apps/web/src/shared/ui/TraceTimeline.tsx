import type { ReactNode } from "react";
import { Space, Timeline, Typography } from "antd";

import { EmptyState, type EmptyStateProps } from "./EmptyState";
import { RiskBadge, type RiskBadgeProps } from "./RiskBadge";
import { StatusTag, type StatusTagProps } from "./StatusTag";

export type TraceTimelineItem = {
  description?: ReactNode;
  key: string;
  risk?: RiskBadgeProps;
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
  if (items.length === 0) {
    return <EmptyState {...empty} />;
  }

  return (
    <Timeline
      items={items.map((item) => ({
        children: (
          <Space direction="vertical" size={4}>
            <Space wrap>
              <Typography.Text strong>{item.title}</Typography.Text>
              {item.status ? <StatusTag {...item.status} /> : null}
              {item.risk ? <RiskBadge {...item.risk} /> : null}
              {item.timestampText ? <Typography.Text type="secondary">{item.timestampText}</Typography.Text> : null}
            </Space>
            {item.description ? <Typography.Text type="secondary">{item.description}</Typography.Text> : null}
          </Space>
        )
      }))}
    />
  );
}
