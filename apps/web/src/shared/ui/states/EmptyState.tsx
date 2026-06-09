import type { ReactNode } from "react";
import { Empty, Space, Typography } from "antd";

import { shellTypographyStyles } from "../../theme/typography";

/**
 * State Pattern：EmptyState 的公共 props 契约。
 *
 * 只描述空态标题、描述和补充 action。
 * 文案与操作由调用方注入，shared/ui 不判断空态来源。
 */
export type EmptyStateProps = {
  /** 空态下的补充操作 slot；是否展示由调用方决定。 */
  action?: ReactNode;
  description?: string;
  title?: string;
};

/**
 * State Pattern：统一空态展示边界。
 *
 * 文案和操作由调用方 ViewModel / i18n 注入；
 * shared/ui 不在内部固化具体页面文案，也不判断业务空态来源。
 */
export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <Empty
      description={
        <Space direction="vertical" size={4}>
          {title ? (
            <Typography.Text style={shellTypographyStyles.cardTitle}>{title}</Typography.Text>
          ) : null}
          {description ? (
            <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
              {description}
            </Typography.Text>
          ) : null}
        </Space>
      }
    >
      {action}
    </Empty>
  );
}
