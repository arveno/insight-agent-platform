import type { ReactNode } from "react";

import type { AppActionGroupItem, AppCardGridColumns } from "../../ui";

export type AppSectionStackProps = {
  children: ReactNode;
};

export type AppSectionProps = {
  action?: AppActionGroupItem;
  children: ReactNode;
  columns?: AppCardGridColumns;
  eyebrow?: ReactNode;
  title: ReactNode;
  useGrid?: boolean;
};
