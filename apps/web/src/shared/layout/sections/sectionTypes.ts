import type { ReactNode } from "react";

export type SectionStackProps = {
  children: ReactNode;
};

/**
 * ContentSection 的公共 props。
 *
 * 只描述 section header 和 children slot。
 * section 内卡片、表格、图表或列表的排列由调用方在 children 中使用
 * Ant Row / Col、Flex 或 Space 组合完成，而不是由 shared/layout 隐式接管。
 */
export type ContentSectionProps = {
  children: ReactNode;
  eyebrow?: ReactNode;
  /** Header 右侧 slot，承接 section 级动作或状态。 */
  extra?: ReactNode;
  title: ReactNode;
};
