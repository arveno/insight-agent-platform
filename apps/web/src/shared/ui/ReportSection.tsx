import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import { RiskBadge, type RiskBadgeProps } from "./RiskBadge";

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
export function ReportSection({ actions, content, evidenceSummary, risk, title }: ReportSectionProps) {
  return (
    <Card>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space wrap>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            {risk ? <RiskBadge {...risk} /> : null}
          </Space>
          {actions}
        </Space>
        <Typography.Paragraph style={{ margin: 0 }}>{content}</Typography.Paragraph>
        {evidenceSummary ? <Typography.Text type="secondary">{evidenceSummary}</Typography.Text> : null}
      </Space>
    </Card>
  );
}
