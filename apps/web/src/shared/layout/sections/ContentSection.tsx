import { Children, isValidElement } from "react";
import { Col, Flex, Row, Space, Typography } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import type { ContentSectionProps } from "./sectionTypes";

/**
 * Layer: Layout / Section Pattern.
 *
 * Based on: Ant Flex / Space / Row / Col.
 * Responsibilities: 统一 section header、children slot，以及受控 `cards / stack` 内容布局。
 * Forbidden responsibilities: 不接业务对象、不做 route 映射、不做排序过滤分组、不做权限判断、
 * 不消费业务 ViewModel。
 * Caller contract: 业务模块只传 children；卡片区通过 `contentLayout="cards"` 和 `colProps`
 * 声明 Ant Col 响应式列宽，复杂自定义区使用 `plain`。如果区域连 section header 都不需要，
 * 就不要使用 ContentSection，直接放到 SectionStack 或模块自定义区域里。
 */
export function ContentSection({
  children,
  contentLayout = "plain",
  colProps = { md: 12, xs: 24 },
  eyebrow,
  extra,
  title
}: ContentSectionProps) {
  const contentNodes = Children.toArray(children);

  const renderedContent =
    contentLayout === "cards" ? (
      <Row gutter={[shellThemeTokens.cardGridGap, shellThemeTokens.cardGridGap]}>
        {contentNodes.map((child, index) => (
          <Col
            {...colProps}
            key={isValidElement(child) && child.key != null ? child.key : index}
          >
            {child}
          </Col>
        ))}
      </Row>
    ) : contentLayout === "stack" ? (
      <Space
        direction="vertical"
        size={shellThemeTokens.sectionContentGap}
        style={{ width: "100%" }}
      >
        {children}
      </Space>
    ) : (
      children
    );

  return (
    <section>
      <Flex
        align="start"
        gap={12}
        justify="space-between"
        style={{ marginBottom: shellThemeTokens.sectionContentGap, width: "100%" }}
        wrap="wrap"
      >
        <Space direction="vertical" size={2}>
          {eyebrow ? (
            <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
              {eyebrow}
            </Typography.Text>
          ) : null}
          <Space align="center" size={8} wrap>
            <Typography.Text style={{ ...shellTypographyStyles.sectionTitle, display: "block" }}>
              {title}
            </Typography.Text>
          </Space>
        </Space>
        {extra ? <div>{extra}</div> : null}
      </Flex>
      {renderedContent}
    </section>
  );
}
