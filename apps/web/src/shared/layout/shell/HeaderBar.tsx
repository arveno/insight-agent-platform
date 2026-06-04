import type { ReactNode } from "react";
import { Flex, Typography } from "antd";

export type HeaderBarProps = {
  title: ReactNode;
};

/**
 * Header 内容区边界。
 *
 * HeaderBar 只展示当前 route title；
 * 不实现真实搜索、权限决策、偏好持久化或用户管理。
 */
export function HeaderBar({ title }: HeaderBarProps) {
  return (
    <Flex align="center" justify="center" style={{ height: "100%", paddingInline: 24 }}>
      <Typography.Text strong>{title}</Typography.Text>
    </Flex>
  );
}
