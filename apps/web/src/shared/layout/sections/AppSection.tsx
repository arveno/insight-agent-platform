import { Flex, Space, Typography } from "antd";

import { AppIcon } from "../../icons";
import { AppActionGroup, AppCardGrid } from "../../ui";
import type { AppSectionProps } from "./sectionTypes";

export function AppSection({
  action,
  children,
  columns = 2,
  eyebrow,
  iconName,
  title,
  useGrid = true
}: AppSectionProps) {
  return (
    <section>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
          <Space direction="vertical" size={2}>
            {eyebrow ? <Typography.Text type="secondary">{eyebrow}</Typography.Text> : null}
            <Typography.Title level={4} style={{ margin: 0 }}>
              {iconName ? <AppIcon name={iconName} variant="glyph" /> : null}
              {title}
            </Typography.Title>
          </Space>
          {action ? <AppActionGroup actions={[action]} /> : null}
        </Flex>

        {useGrid ? <AppCardGrid columns={columns}>{children}</AppCardGrid> : children}
      </Space>
    </section>
  );
}
