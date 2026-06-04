import type { ReactNode } from "react";

export type AppCardGridColumns = 1 | 2 | 3 | 4;

export type AppCardGridProps = {
  children: ReactNode;
  columns?: AppCardGridColumns;
  gutter?: [number, number];
};

export type AppContentCardProps = {
  children?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  footerActions?: ReactNode;
  meta?: ReactNode;
  tagSlot?: ReactNode;
  title: ReactNode;
};
