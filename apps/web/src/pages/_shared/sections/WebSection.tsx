import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import type { StaticSectionViewModel } from "../../../app/models";
import { shellThemeTokens, shellTypographyStyles, StatusTag, useI18n } from "../../../shared";
import { toStatusTag } from "../adapters";
import { translateKey } from "../text";

export type WebSectionProps = {
  children: ReactNode;
  section: StaticSectionViewModel;
};

export function WebSection({ children, section }: WebSectionProps) {
  const { t } = useI18n();

  return (
    <Card
      title={
        <Space wrap>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {translateKey(t, section.titleKey)}
          </Typography.Text>
          <StatusTag {...toStatusTag(t, section.status)!} />
        </Space>
      }
    >
      <Space direction="vertical" size={shellThemeTokens.cardContentGap} style={{ width: "100%" }}>
        <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
          {translateKey(t, section.descriptionKey)}
        </Typography.Text>
        {children}
      </Space>
    </Card>
  );
}
