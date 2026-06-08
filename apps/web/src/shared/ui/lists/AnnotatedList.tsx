import type { ReactNode } from "react";
import { Card, List, Space, Typography } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import { EmptyState } from "../states/EmptyState";
import type { EmptyStateProps } from "../states/EmptyState";
import { RiskBadge } from "../status/RiskBadge";
import type { RiskBadgeProps } from "../status/RiskBadge";
import { StatusTag } from "../status/StatusTag";
import type { StatusTagProps } from "../status/StatusTag";

export type AnnotatedListItem = {
  actions?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  key: string;
  meta?: ReactNode;
  risk?: RiskBadgeProps;
  status?: StatusTagProps;
  title: ReactNode;
};

export type AnnotatedListProps = {
  empty?: EmptyStateProps;
  items: AnnotatedListItem[];
};

/**
 * Mobile / 低密度卡片列表容器。
 *
 * 字段优先级由页面 Surface 和 ViewModel 决定；
 * AnnotatedList 只负责把主字段、状态、风险和操作稳定排布。
 */
export function AnnotatedList({ empty, items }: AnnotatedListProps) {
  if (items.length === 0) {
    return <EmptyState {...empty} />;
  }

  return (
    <List
      dataSource={items}
      renderItem={(item) => (
        <List.Item>
          <Card style={{ width: "100%" }}>
            <Space
              direction="vertical"
              size={shellThemeTokens.cardContentGap}
              style={{ width: "100%" }}
            >
              <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                <Space direction="vertical" size={2}>
                  <Typography.Text style={shellTypographyStyles.cardTitle}>
                    {item.title}
                  </Typography.Text>
                  {item.description ? (
                    <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
                      {item.description}
                    </Typography.Text>
                  ) : null}
                </Space>
                {item.extra}
              </Space>
              <Space wrap>
                {item.status ? <StatusTag {...item.status} /> : null}
                {item.risk ? <RiskBadge {...item.risk} /> : null}
                {item.meta}
              </Space>
              {item.actions ? <div>{item.actions}</div> : null}
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
}
