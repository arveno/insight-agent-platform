import { Button, type ButtonProps } from "antd";

import { AppIcon } from "../../icons";
import type { AppActionButtonProps, AppActionButtonVariant } from "./actionTypes";

const actionButtonPropsByVariant: Record<
  AppActionButtonVariant,
  Pick<ButtonProps, "size" | "type">
> = {
  contextPrimary: { type: "primary" },
  globalPrimary: { type: "primary" },
  moduleEntry: { type: "default" },
  objectDetail: { size: "small", type: "default" },
  sourceLink: { size: "small", type: "link" }
};

export function AppActionButton({
  children,
  iconName,
  variant,
  ...buttonProps
}: AppActionButtonProps) {
  const mappedProps = actionButtonPropsByVariant[variant];

  return (
    <Button {...buttonProps} {...mappedProps}>
      {iconName ? <AppIcon name={iconName} variant="badge" /> : null}
      {children}
    </Button>
  );
}
