import type { ReactNode } from "react";

import type { AppActionGroupItem } from "../../ui/actions/actionTypes";
import type { AppCardGridColumns } from "../../ui/cards/cardTypes";

export type AppSectionStackProps = {
  children: ReactNode;
};

export type AppSectionProps = {
  action?: AppActionGroupItem;
  children: ReactNode;
  columns?: AppCardGridColumns;
  eyebrow?: ReactNode;
  title: ReactNode;
  titleSuffix?: ReactNode;
  useGrid?: boolean;
};
