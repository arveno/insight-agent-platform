import type { ReactNode } from "react";

export type SectionStackProps = {
  children: ReactNode;
};

export type ContentSectionLayout = "wrap" | "vertical";

export type ContentSectionProps = {
  children: ReactNode;
  eyebrow?: ReactNode;
  extra?: ReactNode;
  layout?: ContentSectionLayout;
  title: ReactNode;
};
