import type { CSSProperties, ReactNode } from "react";
import { Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import { CardSurface } from "../surfaces/CardSurface";

export type ContentCardProps = {
  children?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  footerActions?: ReactNode;
  meta?: ReactNode;
  style?: CSSProperties;
  tagSlot?: ReactNode;
  title: ReactNode;
};

export function ContentCard({
  children,
  description,
  eyebrow,
  footerActions,
  meta,
  style,
  tagSlot,
  title
}: ContentCardProps) {
  const { token } = theme.useToken();

  return (
    <CardSurface style={style}>
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
                style={{
                  ...shellTypographyStyles.cardDescription,
                  color: token.colorTextDescription
                }}
              >
                {description}
              </Typography.Text>
            ) : null}
          </Space>
        ) : null}

        {meta ? <div>{meta}</div> : null}

        {footerActions ? <div style={{ marginTop: "auto" }}>{footerActions}</div> : null}
      </div>
    </CardSurface>
  );
}
