import type { ReactNode } from "react";
import type { ButtonProps } from "antd";

import type { IconName } from "../../icons/iconTypes";

export type AppActionButtonVariant =
  | "globalPrimary"
  | "contextPrimary"
  | "moduleEntry"
  | "objectDetail"
  | "sourceLink";

export type AppActionButtonProps = Omit<
  ButtonProps,
  "children" | "color" | "icon" | "size" | "type" | "variant"
> & {
  children: ReactNode;
  iconName?: IconName;
  variant: AppActionButtonVariant;
};

export type AppActionGroupItem = {
  ariaLabel?: string;
  disabled?: boolean;
  iconName?: IconName;
  key: string;
  label: ReactNode;
  onClick?: () => void;
  title?: string;
  variant: AppActionButtonVariant;
};

export type AppActionGroupProps = {
  actions: AppActionGroupItem[];
};
