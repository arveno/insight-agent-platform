import { Flex, Space, Typography } from "antd";

import { AppActionGroup, AppCardGrid } from "../../ui";
import { shellThemeTokens, shellTypographyStyles } from "../../theme";
import type { AppSectionProps } from "./sectionTypes";

export function AppSection({
  action,
  children,
  columns = 2,
  eyebrow,
  title,
  useGrid = true
}: AppSectionProps) {
  return (
    <section>
      <Space direction="vertical" size={shellThemeTokens.pageSectionGap} style={{ width: "100%" }}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
          <Space direction="vertical" size={2}>
            {eyebrow ? (
              <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
                {eyebrow}
              </Typography.Text>
            ) : null}
            <Typography.Text style={{ ...shellTypographyStyles.sectionTitle, display: "block" }}>
              {title}
            </Typography.Text>
          </Space>
          {action ? <AppActionGroup actions={[action]} /> : null}
        </Flex>

        {useGrid ? <AppCardGrid columns={columns}>{children}</AppCardGrid> : children}
      </Space>
    </section>
  );
}
