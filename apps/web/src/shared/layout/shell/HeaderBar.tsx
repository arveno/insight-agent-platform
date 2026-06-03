import type { ReactNode } from "react";
import { Flex, Space, Typography } from "antd";

export type HeaderBarProps = {
  actions?: ReactNode;
  context?: ReactNode;
  status?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
};

/**
 * Header 内容区边界。
 *
 * HeaderBar 展示调用方传入的上下文和全局入口；
 * 不实现真实搜索、权限决策、偏好持久化或用户管理。
 */
export function HeaderBar({ actions, context, status, subtitle, title }: HeaderBarProps) {
  return (
    <Flex align="center" justify="space-between" style={{ height: "100%", paddingInline: 24 }}>
      <Space direction="vertical" size={0}>
        <Space wrap>
          <Typography.Text strong>{title}</Typography.Text>
          {status}
        </Space>
        {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
      </Space>
      <Space size={20}>
        {context}
        {actions}
      </Space>
    </Flex>
  );
}
