import type { ReactNode } from "react";

import type { AppActionGroupItem, AppCardGridColumns } from "../../ui";
import type { IconName } from "../../icons";

export type AppSectionStackProps = {
  children: ReactNode;
};

export type AppSectionProps = {
  action?: AppActionGroupItem;
  children: ReactNode;
  columns?: AppCardGridColumns;
  eyebrow?: ReactNode;
  iconName?: IconName;
  title: ReactNode;
  useGrid?: boolean;
};
