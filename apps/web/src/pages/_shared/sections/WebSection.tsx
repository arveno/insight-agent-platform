import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import type { StaticSectionViewModel } from "../../../app/models/staticViewModelTypes";
import { shellThemeTokens } from "../../../shared/theme/tokens";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { toStatusTag } from "../adapters/viewModelAdapters";
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
