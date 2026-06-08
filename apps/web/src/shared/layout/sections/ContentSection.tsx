import { Flex, Space, Typography } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import type { ContentSectionProps } from "./sectionTypes";

export function ContentSection({
  children,
  eyebrow,
  extra,
  layout = "vertical",
  title
}: ContentSectionProps) {
  const isVertical = layout === "vertical";

  return (
    <section>
      <Space
        direction="vertical"
        size={shellThemeTokens.sectionContentGap}
        style={{ width: "100%" }}
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
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
        <Flex
          gap={16}
          style={{
            flexDirection: isVertical ? "column" : undefined,
            flexWrap: isVertical ? undefined : "wrap"
          }}
          vertical={isVertical}
          wrap={!isVertical}
        >
          {children}
        </Flex>
      </Space>
    </section>
  );
}
