import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import { shellThemeTokens } from "../theme/tokens";
import { shellTypographyStyles } from "../theme/typography";
import { EmptyState } from "../ui/feedback/EmptyState";
import { ErrorState } from "../ui/feedback/ErrorState";
import { LoadingState } from "../ui/feedback/LoadingState";
import type { ChartCardViewModel } from "./chartTypes";

export type ChartCardProps = ChartCardViewModel & {
  children?: ReactNode;
};

/**
 * 图表基础容器。
 *
 * ChartCard 只承接图表标题、状态和 slot；
 * 具体 series 必须由 feature mapper 产出 ViewModel，不直接消费 raw metric rows。
 */
export function ChartCard({
  actions,
  children,
  legend,
  state = { kind: "ready" },
  subtitle,
  title
}: ChartCardProps) {
  let content: ReactNode = children;

  if (state.kind === "loading") {
    content = <LoadingState {...state.loading} />;
  }

  if (state.kind === "empty") {
    content = <EmptyState {...state.empty} />;
  }

  if (state.kind === "error") {
    content = <ErrorState {...state.error} />;
  }

  return (
    <Card>
      <Space direction="vertical" size={shellThemeTokens.cardContentGap} style={{ width: "100%" }}>
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space direction="vertical" size={4}>
            <Typography.Text style={shellTypographyStyles.cardTitle}>{title}</Typography.Text>
            {subtitle ? (
              <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
                {subtitle}
              </Typography.Text>
            ) : null}
          </Space>
          {actions}
        </Space>
        {content}
        {legend}
      </Space>
    </Card>
  );
}
