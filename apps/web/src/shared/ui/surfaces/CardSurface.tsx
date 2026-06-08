import type { ReactNode } from "react";
import { Card, type CardProps, theme } from "antd";

import { shellThemeTokens } from "../../theme/tokens";

/**
 * Surface / Frame：CardSurface 的公共 props。
 *
 * 基于 Ant Card，只暴露视觉壳所需的通用能力。
 * 调用方应把业务内容放入 children，而不是把业务对象或路由语义塞进 surface。
 */
export type CardSurfaceProps = Omit<CardProps, "children"> & {
  children: ReactNode;
};

/**
 * Surface / Frame：统一项目卡片视觉壳。
 *
 * 基于 Ant Card 做薄封装，只统一背景、边框、圆角、padding 和基础表面风格。
 * 不承接业务标题、数据映射、路由、布局编排或页面行为。
 */
export function CardSurface({ children, style, styles, ...cardProps }: CardSurfaceProps) {
  const { token } = theme.useToken();

  return (
    <Card
      {...cardProps}
      style={{
        borderColor: token.colorBorder,
        borderRadius: shellThemeTokens.borderRadiusLG,
        boxShadow: "none",
        height: "100%",
        width: "100%",
        ...style
      }}
      styles={{
        body: { height: "100%", padding: shellThemeTokens.panelPadding },
        ...styles
      }}
    >
      {children}
    </Card>
  );
}
