import { Card, Space, Typography } from "antd";

import { shellThemeTokens, shellTypographyStyles } from "../../theme";
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
    <Card
      style={{
        height: "100%",
        width: "100%"
      }}
      styles={{ body: { height: "100%" } }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: shellThemeTokens.cardContentGap,
          minHeight: "100%"
        }}
      >
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space direction="vertical" size={4} style={{ minWidth: 0 }}>
            {eyebrow ? (
              <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
                {eyebrow}
              </Typography.Text>
            ) : null}
            <Typography.Text style={shellTypographyStyles.cardTitle}>{title}</Typography.Text>
          </Space>
          {tagSlot ? <div style={{ flexShrink: 0 }}>{tagSlot}</div> : null}
        </Space>

        {children || description ? (
          <Space
            direction="vertical"
            size={shellThemeTokens.cardContentGap}
            style={{ width: "100%" }}
          >
            {children}
            {description ? (
              <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
                {description}
              </Typography.Text>
            ) : null}
          </Space>
        ) : null}

        {meta ? <div>{meta}</div> : null}

        {footerActions ? <div style={{ marginTop: "auto" }}>{footerActions}</div> : null}
      </div>
    </Card>
  );
}
