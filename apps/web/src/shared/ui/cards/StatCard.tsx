import type { CSSProperties, ReactNode } from "react";
import { Space, Typography } from "antd";

import { shellTypographyStyles } from "../../theme/typography";
import { RiskBadge } from "../status/RiskBadge";
import type { RiskBadgeProps } from "../status/RiskBadge";
import { StatusTag } from "../status/StatusTag";
import type { StatusTagProps } from "../status/StatusTag";
import { ContentCard } from "./ContentCard";

/**
 * Shared Pattern：StatCard 的公共 props 契约。
 *
 * 基于 ContentCard，只描述通用数值摘要模式。
 * 不接收 MetricDefinition、SourceEvidence、Report 或其它业务对象；
 * 调用方必须先把业务 ViewModel 映射成通用 props。
 */
export type StatCardProps = {
  /** Header 右侧的轻量动作 slot；不承接导航映射或权限判断。 */
  actions?: ReactNode;
  description?: ReactNode;
  /** Footer 动作 slot；按钮布局由调用方负责。 */
  footerActions?: ReactNode;
  /** 通用附加信息 slot，可与 trend / supportingMeta 组合展示。 */
  meta?: ReactNode;
  /** 通用风险表达，必须来自共享状态映射而非业务对象。 */
  risk?: RiskBadgeProps;
  style?: CSSProperties;
  /** 通用状态表达，必须来自共享状态映射而非业务对象。 */
  status?: StatusTagProps;
  /** 与 value 配套的辅助上下文，不得承载 evidence 等业务命名。 */
  supportingMeta?: ReactNode;
  /** Header 右侧 slot，适合注入状态、风险或外部 actions。 */
  tagSlot?: ReactNode;
  title: ReactNode;
  /** 趋势或对比信息 slot；组件不负责计算 trend。 */
  trend?: ReactNode;
  value: ReactNode;
};

/**
 * Shared Pattern：通用数值摘要卡片。
 *
 * 基于 ContentCard，只负责展示 title、value、status、risk、meta 和 trend。
 * 不承接业务对象解析、数据映射、导航决策、排序或权限判断。
 */
export function StatCard({
  actions,
  description,
  footerActions,
  meta,
  risk,
  style,
  status,
  supportingMeta,
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
    meta || trend || supportingMeta ? (
      <Space wrap>
        {meta}
        {trend}
        {supportingMeta}
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
