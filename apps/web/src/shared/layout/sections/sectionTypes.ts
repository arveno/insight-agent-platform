import type { ReactNode } from "react";

export type SectionStackProps = {
  children: ReactNode;
};

export type ContentSectionProps = {
  children: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  titleSuffix?: ReactNode;
};
