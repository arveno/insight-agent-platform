import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import { shellThemeTokens } from "../../shared/theme/tokens";
import { shellTypographyStyles } from "../../shared/theme/typography";
import { RiskBadge } from "../../shared/ui/status/RiskBadge";
import type { RiskBadgeProps } from "../../shared/ui/status/RiskBadge";

export type ReportSectionProps = {
  actions?: ReactNode;
  content: ReactNode;
  evidenceSummary?: ReactNode;
  risk?: RiskBadgeProps;
  title: ReactNode;
};

/**
 * 报告段落展示边界。
 *
 * content 必须来自 ReportSection ViewModel；
 * 组件不展示模型原始输出，也不承接完整 ReportReader 编排。
 */
export function ReportSection({
  actions,
  content,
  evidenceSummary,
  risk,
  title
}: ReportSectionProps) {
  return (
    <Card>
      <Space direction="vertical" size={shellThemeTokens.cardContentGap} style={{ width: "100%" }}>
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space wrap>
            <Typography.Text style={shellTypographyStyles.cardTitle}>{title}</Typography.Text>
            {risk ? <RiskBadge {...risk} /> : null}
          </Space>
          {actions}
        </Space>
        <Typography.Paragraph style={{ ...shellTypographyStyles.body, margin: 0 }}>
          {content}
        </Typography.Paragraph>
        {evidenceSummary ? (
          <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
            {evidenceSummary}
          </Typography.Text>
        ) : null}
      </Space>
    </Card>
  );
}
