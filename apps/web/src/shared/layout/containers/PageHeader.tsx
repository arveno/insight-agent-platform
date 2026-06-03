import type { ReactNode } from "react";
import { Space, Typography } from "antd";

export type PageHeaderProps = {
  actions?: ReactNode;
  meta?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
};

/**
 * 页面标题区。
 *
 * 只展示页面级 ViewModel 提供的标题、摘要和轻操作；
 * 不承担页面业务清洗。
 */
export function PageHeader({ actions, meta, subtitle, title }: PageHeaderProps) {
  return (
    <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
      <Space direction="vertical" size={4}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
        {meta}
      </Space>
      {actions}
    </Space>
  );
}
