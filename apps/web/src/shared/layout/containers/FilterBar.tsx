import type { ReactNode } from "react";
import { Card, Space } from "antd";

export type FilterBarProps = {
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * 筛选区布局容器。
 *
 * FilterBar 只排列调用方传入的筛选控件；
 * 不持有筛选业务规则，也不解析 raw query。
 */
export function FilterBar({ actions, children }: FilterBarProps) {
  return (
    <Card>
      <Space align="center" style={{ justifyContent: "space-between", width: "100%" }} wrap>
        <Space wrap>{children}</Space>
        {actions}
      </Space>
    </Card>
  );
}
