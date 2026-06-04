import type { ReactNode } from "react";
import type { ButtonProps } from "antd";

import type { IconName } from "../../icons";

export type AppActionButtonVariant =
  | "globalPrimary"
  | "contextPrimary"
  | "moduleEntry"
  | "objectDetail"
  | "sourceLink";

export type AppActionButtonProps = Omit<
  ButtonProps,
  "children" | "icon" | "size" | "type" | "variant"
> & {
  children: ReactNode;
  iconName?: IconName;
  variant: AppActionButtonVariant;
};
