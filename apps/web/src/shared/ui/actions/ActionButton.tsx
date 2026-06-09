import { Button, type ButtonProps } from "antd";

import { AppIcon } from "../../icons/AppIcon";
import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import type { ActionButtonProps, ActionButtonVariant } from "./actionTypes";

const actionButtonPropsByVariant: Record<
  ActionButtonVariant,
  Pick<ButtonProps, "color" | "size" | "type" | "variant">
> = {
  contextPrimary: { color: "default", variant: "solid" },
  globalPrimary: { color: "default", variant: "solid" },
  moduleEntry: { type: "default" },
  objectDetail: { size: "small", type: "default" },
  sourceLink: { size: "small", type: "link" }
};

/**
 * UI Primitive：项目按钮薄封装。
 *
 * 基于 Ant Button，只统一 variant、图标和项目级排版风格。
 * 不负责导航、排序、权限判断、业务判断或 route 映射。
 * 业务模块必须先决定按钮是否展示、如何排序，再把通用 props 传给这里。
 */
export function ActionButton({
  children,
  iconName,
  style,
  variant,
  ...buttonProps
}: ActionButtonProps) {
  const mappedProps = actionButtonPropsByVariant[variant];

  return (
    <Button
      {...buttonProps}
      {...mappedProps}
      icon={
        iconName ? (
          <span style={{ display: "inline-flex", marginInlineEnd: -4 }}>
            <AppIcon name={iconName} variant="badge" />
          </span>
        ) : undefined
      }
      style={{
        ...shellTypographyStyles.buttonLabel,
        alignItems: "center",
        borderRadius: shellThemeTokens.borderRadiusSM,
        display: "inline-flex",
        gap: 0,
        ...style
      }}
    >
      {children}
    </Button>
  );
}
