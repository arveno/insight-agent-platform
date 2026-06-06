import { Card, Space, Typography, theme } from "antd";

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
  const { token } = theme.useToken();

  return (
    <Card
      style={{
        borderColor: token.colorBorder,
        borderRadius: shellThemeTokens.borderRadiusLG,
        boxShadow: "none",
        height: "100%",
        width: "100%"
      }}
      styles={{ body: { height: "100%", padding: shellThemeTokens.panelPadding } }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: shellThemeTokens.cardContentGap,
          minHeight: "100%"
        }}
      >
        <Space align="start" size={8} style={{ justifyContent: "space-between", width: "100%" }}>
          <Space direction="vertical" size={3} style={{ minWidth: 0 }}>
            {eyebrow ? (
              <Typography.Text
                type="secondary"
                style={{ ...shellTypographyStyles.meta, color: token.colorTextDescription }}
              >
                {eyebrow}
              </Typography.Text>
            ) : null}
            <Typography.Text style={{ ...shellTypographyStyles.cardTitle, color: token.colorText }}>
              {title}
            </Typography.Text>
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
              <Typography.Text
                type="secondary"
                style={{ ...shellTypographyStyles.cardDescription, color: token.colorTextDescription }}
              >
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
