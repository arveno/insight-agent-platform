import type { ReactNode } from "react";
import { Space, Typography } from "antd";

import { shellTypographyStyles } from "../../../shared/theme/typography";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import type { RiskBadgeProps } from "../../../shared/ui/status/RiskBadge";

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
    <ContentCard
      meta={
        evidenceSummary ? (
          <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
            {evidenceSummary}
          </Typography.Text>
        ) : null
      }
      tagSlot={
        risk || actions ? (
          <Space wrap>
            {risk ? <RiskBadge {...risk} /> : null}
            {actions}
          </Space>
        ) : null
      }
      title={title}
    >
      <Typography.Paragraph style={{ ...shellTypographyStyles.body, margin: 0 }}>
        {content}
      </Typography.Paragraph>
    </ContentCard>
  );
}
