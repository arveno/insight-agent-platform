import type { ReactNode } from "react";
import { Space, Typography } from "antd";

import { shellTypographyStyles } from "../../../shared/theme/typography";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import type { RiskBadgeProps } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import type { StatusTagProps } from "../../../shared/ui/status/StatusTag";

export type DecisionCardProps = {
  actions?: ReactNode;
  description?: ReactNode;
  evidenceSummary?: ReactNode;
  risk?: RiskBadgeProps;
  status?: StatusTagProps;
  title: ReactNode;
};

/**
 * 决策建议卡片。
 *
 * 只展示 Decision / ActionSuggestion 派生 ViewModel；
 * 不自动采纳决策，也不执行真实业务动作。
 */
export function DecisionCard({
  actions,
  description,
  evidenceSummary,
  risk,
  status,
  title
}: DecisionCardProps) {
  return (
    <ContentCard
      description={description}
      footerActions={actions ? <div>{actions}</div> : null}
      meta={
        evidenceSummary ? (
          <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
            {evidenceSummary}
          </Typography.Text>
        ) : null
      }
      tagSlot={
        status || risk ? (
          <Space wrap>
            {status ? <StatusTag {...status} /> : null}
            {risk ? <RiskBadge {...risk} /> : null}
          </Space>
        ) : null
      }
      title={title}
    />
  );
}
