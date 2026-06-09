import type { ReactNode } from "react";
import type { ColProps } from "antd";

export type SectionStackProps = {
  children: ReactNode;
};

/**
 * ContentSection 的公共 props。
 *
 * `contentLayout="plain"` 只保留 section header 和语义，children 原样渲染；
 * `contentLayout="cards"` 使用受控 Ant Row / Col 卡片布局；
 * `contentLayout="stack"` 使用受控纵向内容堆叠。
 * 未显式声明时，`contentLayout` 默认是 `plain`。
 *
 * `colProps` 仅在 `cards` 布局下生效，遵循 Ant Col 的响应式语义，
 * 例如 `xs={24}`、`md={12}`、`xl={8}`。
 */
export type ContentSectionProps = {
  children: ReactNode;
  eyebrow?: ReactNode;
  /** Header 右侧 slot，承接 section 级动作或状态。 */
  contentLayout?: "plain" | "cards" | "stack";
  /** 仅 `cards` 布局使用的 Ant Col 响应式列宽配置。 */
  colProps?: ColProps;
  extra?: ReactNode;
  title: ReactNode;
};
