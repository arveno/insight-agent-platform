import type { ReactNode } from "react";
import { List, Space, Typography } from "antd";

import { shellTypographyStyles } from "../../theme/typography";
import { EmptyState } from "../states/EmptyState";
import type { EmptyStateProps } from "../states/EmptyState";
import { RiskBadge } from "../status/RiskBadge";
import type { RiskBadgeProps } from "../status/RiskBadge";

export type TitledListItem = {
  actions?: ReactNode;
  key: string;
  meta?: ReactNode;
  risk?: RiskBadgeProps;
  summary?: ReactNode;
  title: ReactNode;
};

export type TitledListProps = {
  empty?: EmptyStateProps;
  items: TitledListItem[];
};

export function TitledList({ empty, items }: TitledListProps) {
  if (items.length === 0) {
    return <EmptyState {...empty} />;
  }

  return (
    <List
      dataSource={items}
      renderItem={(item) => (
        <List.Item actions={item.actions ? [item.actions] : undefined}>
          <List.Item.Meta
            title={
              <Space wrap>
                <Typography.Text style={shellTypographyStyles.cardTitle}>
                  {item.title}
                </Typography.Text>
                {item.meta}
                {item.risk ? <RiskBadge {...item.risk} /> : null}
              </Space>
            }
            description={item.summary}
          />
        </List.Item>
      )}
    />
  );
}
