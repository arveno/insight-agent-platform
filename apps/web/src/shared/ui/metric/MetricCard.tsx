import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import { RiskBadge, type RiskBadgeProps, StatusTag, type StatusTagProps } from "../status";

export type MetricCardProps = {
  actions?: ReactNode;
  description?: ReactNode;
  evidenceSummary?: ReactNode;
  footerActions?: ReactNode;
  meta?: ReactNode;
  risk?: RiskBadgeProps;
  status?: StatusTagProps;
  tagSlot?: ReactNode;
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
  meta,
  risk,
  status,
  tagSlot,
  title,
  trend,
  value
}: MetricCardProps) {
  const resolvedTagSlot =
    tagSlot || status || risk || actions ? (
      <Space wrap>
        {tagSlot}
        {status ? <StatusTag {...status} /> : null}
        {risk ? <RiskBadge {...risk} /> : null}
        {actions}
      </Space>
    ) : null;
  const resolvedMeta =
    meta || trend || evidenceSummary ? (
      <Space wrap>
        {meta}
        {trend}
        {evidenceSummary}
      </Space>
    ) : null;

  return (
    <Card style={{ height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: "100%" }}>
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space direction="vertical" size={4}>
            <Typography.Text type="secondary">{title}</Typography.Text>
          </Space>
          {resolvedTagSlot ? <div style={{ flexShrink: 0 }}>{resolvedTagSlot}</div> : null}
        </Space>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {value}
          </Typography.Title>
          {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
        </Space>
        {resolvedMeta ? <div>{resolvedMeta}</div> : null}
        {footerActions ? <div style={{ marginTop: "auto" }}>{footerActions}</div> : null}
      </div>
    </Card>
  );
}
