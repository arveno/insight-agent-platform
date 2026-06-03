import type { ReactNode } from "react";
import { List, Space, Typography } from "antd";

import { EmptyState, type EmptyStateProps } from "../feedback";
import { RiskBadge, type RiskBadgeProps } from "../status";

export type SourceEvidenceItem = {
  actions?: ReactNode;
  confidenceText?: string;
  key: string;
  risk?: RiskBadgeProps;
  sourceTypeLabel: string;
  summary?: string;
  title: string;
};

export type SourceEvidenceListProps = {
  empty?: EmptyStateProps;
  items: SourceEvidenceItem[];
};

/**
 * SourceEvidence 展示边界。
 *
 * 组件只展示脱敏后的 SourceEvidence ViewModel；
 * 不解析 SQL、Tool raw output 或 provider 原始响应。
 */
export function SourceEvidenceList({ empty, items }: SourceEvidenceListProps) {
  if (items.length === 0) {
    return <EmptyState {...empty} />;
  }

  return (
    <List
      dataSource={items}
      renderItem={(item) => (
        <List.Item actions={item.actions ? [item.actions] : undefined}>
          <List.Item.Meta
            title={
              <Space wrap>
                <Typography.Text strong>{item.title}</Typography.Text>
                <Typography.Text type="secondary">{item.sourceTypeLabel}</Typography.Text>
                {item.confidenceText ? <Typography.Text type="secondary">{item.confidenceText}</Typography.Text> : null}
                {item.risk ? <RiskBadge {...item.risk} /> : null}
              </Space>
            }
            description={item.summary}
          />
        </List.Item>
      )}
    />
  );
}
