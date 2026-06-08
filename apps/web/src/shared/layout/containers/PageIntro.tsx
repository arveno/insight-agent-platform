import { Children, isValidElement, type ReactNode } from "react";
import { Col, type ColProps, Flex, Row, Space, Typography } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import { CardSurface } from "../../ui/surfaces/CardSurface";

/**
 * Layer: Layout / Container Pattern.
 *
 * Based on: CardSurface, Ant Flex / Space / Row / Col / Typography.
 * Responsibilities: 页面顶部介绍区、左侧标题说明、右侧 extra 操作区、可选 `cards / stack`
 * 内容布局。
 * Forbidden responsibilities: 不接业务对象、不做 route 映射、不做排序过滤分组、不做权限判断、
 * 不消费业务 ViewModel、不依赖 app / modules。
 * Caller contract: 业务模块传入通用 ReactNode；页面操作区通过 `extra` 传入；小卡片区通过
 * `contentLayout="cards"` 和 `colProps` 声明；如果页面没有顶部标题介绍区，就不要使用
 * PageIntro。
 */
export type PageIntroProps = {
  children?: ReactNode;
  colProps?: ColProps;
  contentLayout?: "plain" | "cards" | "stack";
  description?: ReactNode;
  eyebrow?: ReactNode;
  extra?: ReactNode;
  supportingText?: ReactNode;
  title: ReactNode;
};

/**
 * Layer: Layout / Container Pattern.
 *
 * Based on: CardSurface, Ant Flex / Space / Row / Col / Typography.
 * Responsibilities: 页面顶部介绍区、左侧标题说明、右侧 extra 操作区、可选 `cards / stack`
 * 内容布局。
 * Forbidden responsibilities: 不接业务对象、不做 route 映射、不做排序过滤分组、不做权限判断、
 * 不消费业务 ViewModel、不依赖 app / modules。
 * Caller contract: 业务模块传入通用 ReactNode；页面操作区通过 `extra` 传入；小卡片区通过
 * `contentLayout="cards"` 和 `colProps` 声明；如果页面没有顶部标题介绍区，就不要使用
 * PageIntro。
 */
export function PageIntro({
  children,
  colProps = { md: 12, xs: 24 },
  contentLayout = "plain",
  description,
  eyebrow,
  extra,
  supportingText,
  title
}: PageIntroProps) {
  const contentNodes = Children.toArray(children);
  const hasContent = contentNodes.length > 0;

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
    <CardSurface>
      <Space direction="vertical" size={shellThemeTokens.sectionContentGap} style={{ width: "100%" }}>
        <Flex
          align="start"
          gap={shellThemeTokens.sectionContentGap}
          justify="space-between"
          style={{ width: "100%" }}
          wrap="wrap"
        >
          <Space direction="vertical" size={shellThemeTokens.shellSectionGap} style={{ flex: "1 1 0", minWidth: 0 }}>
            {eyebrow ? (
              <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
                {eyebrow}
              </Typography.Text>
            ) : null}
            <Typography.Text style={{ ...shellTypographyStyles.pageTitle, display: "block" }}>
              {title}
            </Typography.Text>
            {description ? (
              <Typography.Text type="secondary" style={shellTypographyStyles.body}>
                {description}
              </Typography.Text>
            ) : null}
            {supportingText ? (
              <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
                {supportingText}
              </Typography.Text>
            ) : null}
          </Space>
          {extra ? <Flex justify="flex-end">{extra}</Flex> : null}
        </Flex>
        {hasContent ? renderedContent : null}
      </Space>
    </CardSurface>
  );
}
