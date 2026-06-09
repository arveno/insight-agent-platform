import { Children, isValidElement, type ReactNode } from "react";
import { Col, type ColProps, Row, Space } from "antd";

import { shellThemeTokens } from "../theme/tokens";

export type ContentSlotLayoutMode = "plain" | "cards" | "stack";

/**
 * Layer: Layout / Slot Primitive.
 *
 * Based on: Ant Row / Col / Space.
 * Responsibilities: 只负责 `plain / cards / stack` children slot 布局。
 * Forbidden responsibilities: 不接 section header、不接页面标题区、不接业务对象、不做 route 映射、
 * 不做排序过滤分组、不依赖 app / modules。
 * Caller contract: 调用方传入普通 ReactNode children；卡片区通过 `colProps` 声明响应式列宽；
 * 如果只是原样渲染，保持默认 `plain`。
 */
export type ContentSlotLayoutProps = {
  children?: ReactNode;
  colProps?: ColProps;
  layout?: ContentSlotLayoutMode;
};

/**
 * Layer: Layout / Slot Primitive.
 *
 * Based on: Ant Row / Col / Space.
 * Responsibilities: 只负责 `plain / cards / stack` children slot 布局。
 * Forbidden responsibilities: 不接 section header、不接页面标题区、不接业务对象、不做 route 映射、
 * 不做排序过滤分组、不依赖 app / modules。
 * Caller contract: 调用方传入普通 ReactNode children；卡片区通过 `colProps` 声明响应式列宽；
 * 如果只是原样渲染，保持默认 `plain`。
 */
export function ContentSlotLayout({
  children,
  colProps = { md: 12, xs: 24 },
  layout = "plain"
}: ContentSlotLayoutProps) {
  const contentNodes = Children.toArray(children);

  if (contentNodes.length === 0) {
    return null;
  }

  if (layout === "cards") {
    return (
      <Row gutter={[shellThemeTokens.cardGridGap, shellThemeTokens.cardGridGap]}>
        {contentNodes.map((child, index) => (
          <Col {...colProps} key={isValidElement(child) && child.key != null ? child.key : index}>
            {child}
          </Col>
        ))}
      </Row>
    );
  }

  if (layout === "stack") {
    return (
      <Space
        direction="vertical"
        size={shellThemeTokens.sectionContentGap}
        style={{ width: "100%" }}
      >
        {children}
      </Space>
    );
  }

  return <>{children}</>;
}
