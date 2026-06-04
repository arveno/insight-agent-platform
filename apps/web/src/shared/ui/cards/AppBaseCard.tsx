import { Card, Space, Typography } from "antd";

import type { AppBaseCardProps } from "./cardTypes";

export function AppBaseCard({
  children,
  description,
  eyebrow,
  footerActions,
  meta,
  tagSlot,
  title
}: AppBaseCardProps) {
  return (
    <Card style={{ height: "100%", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: "100%" }}>
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space direction="vertical" size={4} style={{ minWidth: 0 }}>
            {eyebrow ? <Typography.Text type="secondary">{eyebrow}</Typography.Text> : null}
            <Typography.Text strong>{title}</Typography.Text>
          </Space>
          {tagSlot ? <div style={{ flexShrink: 0 }}>{tagSlot}</div> : null}
        </Space>

        {children || description ? (
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {children}
            {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
          </Space>
        ) : null}

        {meta ? <div>{meta}</div> : null}

        {footerActions ? <div style={{ marginTop: "auto" }}>{footerActions}</div> : null}
      </div>
    </Card>
  );
}
