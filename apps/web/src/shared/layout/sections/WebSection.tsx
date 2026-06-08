import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import type { StaticSectionViewModel } from "../../../app/shell/models/staticViewModelTypes";
import { useI18n } from "../../i18n/I18nProvider";
import { translateKey } from "../../i18n/translateKey";
import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import { toStatusTag } from "../../utils/viewModelState";

import { StatusTag } from "../../ui/status/StatusTag";

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
