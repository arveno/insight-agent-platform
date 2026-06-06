import type { ReactNode } from "react";
import { Space, Typography } from "antd";

import { shellTypographyStyles } from "../../theme/typography";
import { RiskBadge } from "../status/RiskBadge";
import type { RiskBadgeProps } from "../status/RiskBadge";
import { StatusTag } from "../status/StatusTag";
import type { StatusTagProps } from "../status/StatusTag";
import { AppBaseCard } from "./AppBaseCard";

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
    <AppBaseCard
      description={description}
      footerActions={footerActions}
      meta={resolvedMeta}
      tagSlot={resolvedTagSlot}
      title={title}
    >
      <Typography.Text style={{ ...shellTypographyStyles.metricValue, display: "block" }}>
        {value}
      </Typography.Text>
    </AppBaseCard>
  );
}
