import { Flex, Space, Typography } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import type { ContentSectionProps } from "./sectionTypes";

export function ContentSection({
  children,
  eyebrow,
  title,
  titleSuffix
}: ContentSectionProps) {
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
              <Typography.Text
                style={{ ...shellTypographyStyles.sectionTitle, display: "block" }}
              >
                {title}
              </Typography.Text>
              {titleSuffix}
            </Space>
          </Space>
        </Flex>
        {children}
      </Space>
    </section>
  );
}
