import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import { RiskBadge } from "../status/RiskBadge";
import type { RiskBadgeProps } from "../status/RiskBadge";
import { StatusTag } from "../status/StatusTag";
import type { StatusTagProps } from "../status/StatusTag";

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
    <Card>
      <Space direction="vertical" size={shellThemeTokens.cardContentGap} style={{ width: "100%" }}>
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space direction="vertical" size={4}>
            <Typography.Text style={shellTypographyStyles.cardTitle}>{title}</Typography.Text>
            {description ? (
              <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
                {description}
              </Typography.Text>
            ) : null}
          </Space>
          <Space wrap>
            {status ? <StatusTag {...status} /> : null}
            {risk ? <RiskBadge {...risk} /> : null}
          </Space>
        </Space>
        {evidenceSummary ? (
          <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
            {evidenceSummary}
          </Typography.Text>
        ) : null}
        {actions ? <div>{actions}</div> : null}
      </Space>
    </Card>
  );
}
