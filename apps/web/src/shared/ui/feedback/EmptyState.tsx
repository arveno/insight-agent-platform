import type { ReactNode } from "react";
import { Empty, Space, Typography } from "antd";

export type EmptyStateProps = {
  action?: ReactNode;
  description?: string;
  title?: string;
};

/**
 * 统一空态展示边界。
 *
 * 文案和操作由调用方 ViewModel / i18n 注入；
 * shared/ui 不在内部固化具体页面文案，也不判断业务空态来源。
 */
export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <Empty
      description={
        <Space direction="vertical" size={4}>
          {title ? <Typography.Text strong>{title}</Typography.Text> : null}
          {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
        </Space>
      }
    >
      {action}
    </Empty>
  );
}
