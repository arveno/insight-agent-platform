import type { CSSProperties, ReactNode } from "react";
import { Space, Typography } from "antd";

import { shellTypographyStyles } from "../../theme/typography";
import { RiskBadge } from "../status/RiskBadge";
import type { RiskBadgeProps } from "../status/RiskBadge";
import { StatusTag } from "../status/StatusTag";
import type { StatusTagProps } from "../status/StatusTag";
import { ContentCard } from "./ContentCard";

export type StatCardProps = {
  actions?: ReactNode;
  description?: ReactNode;
  evidenceSummary?: ReactNode;
  footerActions?: ReactNode;
  meta?: ReactNode;
  risk?: RiskBadgeProps;
  style?: CSSProperties;
  status?: StatusTagProps;
  tagSlot?: ReactNode;
  title: ReactNode;
  trend?: ReactNode;
  value: ReactNode;
};

/**
 * 通用数值摘要卡片。
 *
 * 组件只负责展示 title / value / status / risk / meta；
 * 不承接业务对象解析、数据映射或导航决策。
 */
export function StatCard({
  actions,
  description,
  evidenceSummary,
  footerActions,
  meta,
  risk,
  style,
  status,
  tagSlot,
  title,
  trend,
  value
}: StatCardProps) {
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
    <ContentCard
      description={description}
      footerActions={footerActions}
      meta={resolvedMeta}
      style={style}
      tagSlot={resolvedTagSlot}
      title={title}
    >
      <Typography.Text style={{ ...shellTypographyStyles.metricValue, display: "block" }}>
        {value}
      </Typography.Text>
    </ContentCard>
  );
}
