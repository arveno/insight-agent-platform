import { Button, type ButtonProps } from "antd";

import { AppIcon } from "../../icons";
import { shellThemeTokens, shellTypographyStyles } from "../../theme";
import type { AppActionButtonProps, AppActionButtonVariant } from "./actionTypes";

const actionButtonPropsByVariant: Record<
  AppActionButtonVariant,
  Pick<ButtonProps, "color" | "size" | "type" | "variant">
> = {
  contextPrimary: { color: "default", variant: "solid" },
  globalPrimary: { color: "default", variant: "solid" },
  moduleEntry: { type: "default" },
  objectDetail: { size: "small", type: "default" },
  sourceLink: { size: "small", type: "link" }
};

export function AppActionButton({
  children,
  iconName,
  style,
  variant,
  ...buttonProps
}: AppActionButtonProps) {
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
