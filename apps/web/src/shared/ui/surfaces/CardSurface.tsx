import type { ReactNode } from "react";
import { Card, type CardProps, theme } from "antd";

import { shellThemeTokens } from "../../theme/tokens";

export type CardSurfaceProps = Omit<CardProps, "children"> & {
  children: ReactNode;
};

/**
 * 统一项目卡片视觉壳。
 *
 * CardSurface 只负责边框、圆角、内边距和基础表面风格；
 * 不承接业务标题、数据映射、路由或行为编排。
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
