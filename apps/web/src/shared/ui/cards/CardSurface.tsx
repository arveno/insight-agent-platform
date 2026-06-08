import type { ReactNode } from "react";
import { Card, type CardProps, theme } from "antd";

import { shellThemeTokens } from "../../theme/tokens";

export type CardSurfaceProps = Omit<CardProps, "children"> & {
  children: ReactNode;
};

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
