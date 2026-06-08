import type { ReactNode } from "react";
import type { ButtonProps } from "antd";

import type { IconName } from "../../icons/iconTypes";

export type ActionButtonVariant =
  | "globalPrimary"
  | "contextPrimary"
  | "moduleEntry"
  | "objectDetail"
  | "sourceLink";

export type ActionButtonProps = Omit<
  ButtonProps,
  "children" | "color" | "icon" | "size" | "type" | "variant"
> & {
  children: ReactNode;
  iconName?: IconName;
  variant: ActionButtonVariant;
};
