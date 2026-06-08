import { Flex, Space, Typography } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import type { ContentSectionProps } from "./sectionTypes";

/**
 * Shared Pattern：通用 section header 容器。
 *
 * 只负责 eyebrow / title / extra 这类 section header 语义，以及 children slot。
 * 不负责卡片区 Row / Col 排列，不知道 NavigationActionButton、route 或业务对象。
 */
export function ContentSection({ children, eyebrow, extra, title }: ContentSectionProps) {
  return (
    <section>
      <Space
        direction="vertical"
        size={shellThemeTokens.sectionContentGap}
        style={{ width: "100%" }}
      >
        <Flex align="start" justify="space-between" wrap="wrap" gap={12}>
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
        {children}
      </Space>
    </section>
  );
}
