import type { ReactNode } from "react";
import { List, Space, Typography } from "antd";

import { shellTypographyStyles } from "../../theme/typography";
import { EmptyState } from "../states/EmptyState";
import type { EmptyStateProps } from "../states/EmptyState";
import { RiskBadge } from "../status/RiskBadge";
import type { RiskBadgeProps } from "../status/RiskBadge";

/**
 * Shared Pattern：TitledList 的通用 item contract。
 *
 * 用于 title + summary 的列表模式，不包含业务对象。
 * 业务模块必须先把对象映射成 title、summary、meta、risk 和 actions 等通用字段。
 */
export type TitledListItem = {
  /** 单项动作 slot；排序和显隐必须在调用方完成。 */
  actions?: ReactNode;
  key: string;
  /** 紧邻标题的次级信息 slot，例如标签或短 meta。 */
  meta?: ReactNode;
  risk?: RiskBadgeProps;
  summary?: ReactNode;
  title: ReactNode;
};

/**
 * Shared Pattern：TitledList 的公共 props 契约。
 *
 * empty 只描述空态展示，items 必须是已经去业务化的通用列表项。
 */
export type TitledListProps = {
  empty?: EmptyStateProps;
  items: TitledListItem[];
};

/**
 * Shared Pattern：标题摘要列表。
 *
 * 基于 Ant List / Typography，只负责稳定排布 title、summary、risk 和 actions。
 * 不负责业务对象解析、排序或 route 映射。
 */
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
