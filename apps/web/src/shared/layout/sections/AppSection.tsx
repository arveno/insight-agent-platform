import { Flex, Space, Typography } from "antd";

import { AppActionGroup } from "../../ui/actions/AppActionGroup";
import { AppCardGrid } from "../../ui/cards/AppCardGrid";
import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import type { AppSectionProps } from "./sectionTypes";

export function AppSection({
  action,
  children,
  columns = 2,
  eyebrow,
  title,
  titleSuffix,
  useGrid = true
}: AppSectionProps) {
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
          {action ? <AppActionGroup actions={[action]} /> : null}
        </Flex>

        {useGrid ? <AppCardGrid columns={columns}>{children}</AppCardGrid> : children}
      </Space>
    </section>
  );
}
