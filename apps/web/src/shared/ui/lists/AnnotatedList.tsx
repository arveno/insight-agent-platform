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

/**
 * Shared Pattern：AnnotatedList 的通用 item contract。
 *
 * 适用于需要 title、description、status、risk 和 actions 的注释型列表展示。
 * 不包含 SourceEvidence、Report、RunTrace 等业务对象；调用方必须先完成映射。
 */
export type AnnotatedListItem = {
  /** 行内动作 slot；排序、显隐和权限判断必须在调用方完成。 */
  actions?: ReactNode;
  description?: ReactNode;
  /** Header 右侧的补充 slot，不承接 route 映射或业务判断。 */
  extra?: ReactNode;
  key: string;
  meta?: ReactNode;
  risk?: RiskBadgeProps;
  status?: StatusTagProps;
  title: ReactNode;
};

/**
 * Shared Pattern：AnnotatedList 的公共 props 契约。
 *
 * 组件只消费通用列表项和空态配置，不解析业务对象或 raw data。
 */
export type AnnotatedListProps = {
  empty?: EmptyStateProps;
  items: AnnotatedListItem[];
};

/**
 * Shared Pattern：注释型列表容器。
 *
 * 基于 Ant List / Card，只负责把主字段、状态、风险和操作稳定排布。
 * 字段优先级和业务含义由调用方 ViewModel 决定；组件不做业务映射、权限判断或排序。
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
