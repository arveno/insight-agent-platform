import type { ReactNode } from "react";

export type AppContentCardProps = {
  children?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  footerActions?: ReactNode;
  meta?: ReactNode;
  tagSlot?: ReactNode;
  title: ReactNode;
};
