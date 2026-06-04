import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import { RiskBadge, type RiskBadgeProps, StatusTag, type StatusTagProps } from "../status";

export type MetricCardProps = {
  actions?: ReactNode;
  description?: ReactNode;
  evidenceSummary?: ReactNode;
  footerActions?: ReactNode;
  risk?: RiskBadgeProps;
  status?: StatusTagProps;
  title: ReactNode;
  trend?: ReactNode;
  value: ReactNode;
};

/**
 * 指标摘要卡片。
 *
 * 只展示 Metric / MetricThreshold / SourceEvidence 派生 ViewModel；
 * 不计算指标、不读取 raw metric rows，也不定义业务钻取动作。
 */
export function MetricCard({
  actions,
  description,
  evidenceSummary,
  footerActions,
  risk,
  status,
  title,
  trend,
  value
}: MetricCardProps) {
  return (
    <Card>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space direction="vertical" size={4}>
            <Typography.Text type="secondary">{title}</Typography.Text>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {value}
            </Typography.Title>
          </Space>
          {actions}
        </Space>
        <Space wrap>
          {status ? <StatusTag {...status} /> : null}
          {risk ? <RiskBadge {...risk} /> : null}
          {trend}
        </Space>
        {description ? <Typography.Text>{description}</Typography.Text> : null}
        {evidenceSummary ? (
          <Typography.Text type="secondary">{evidenceSummary}</Typography.Text>
        ) : null}
        {footerActions}
      </Space>
    </Card>
  );
}
