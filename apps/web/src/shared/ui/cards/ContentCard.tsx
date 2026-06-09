import type { CSSProperties, ReactNode } from "react";
import { Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import { CardSurface } from "../surfaces/CardSurface";

/**
 * Shared Pattern：ContentCard 的公共 props 契约。
 *
 * 基于 CardSurface，承接 title、description、meta、tagSlot 和 footerActions
 * 这类通用内容卡片结构。调用方必须先把业务 ViewModel 映射成通用 slot，
 * 不能把业务对象直接传入 shared/ui。
 */
export type ContentCardProps = {
  children?: ReactNode;
  description?: ReactNode;
  /** 位于标题上方的弱语义前缀信息，不应用于业务状态推断。 */
  eyebrow?: ReactNode;
  /** Footer 动作 slot；按钮排列由调用方用 Ant Flex / Space 组织。 */
  footerActions?: ReactNode;
  /** 通用附加信息 slot，适合展示说明性 meta，而非业务对象本身。 */
  meta?: ReactNode;
  style?: CSSProperties;
  /** Header 右侧 slot，通常用于状态、风险或轻量动作。 */
  tagSlot?: ReactNode;
  title: ReactNode;
};

/**
 * Shared Pattern：通用内容卡片。
 *
 * 基于 CardSurface，只负责稳定的标题区、内容区和 footer 结构。
 * 不解析业务对象，不做路由映射，也不绑定具体内容类型。
 */
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
