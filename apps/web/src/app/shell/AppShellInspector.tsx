import { Space, Typography, theme } from "antd";

import { RightAssistPanel } from "../../shared/layout/shell/RightAssistPanel";
import { shellThemeTokens } from "../../shared/theme/tokens";
import { shellTypographyStyles } from "../../shared/theme/typography";
import type { I18nMessageKey } from "../../shared/i18n/messages";
import { useI18n } from "../../shared/i18n/I18nProvider";

import type { AppShellInspectorViewModel } from "./models/appShellViewModel";

export type AppShellInspectorProps = {
  inspector: AppShellInspectorViewModel;
  workspaceName: string;
};

export function AppShellInspector({ inspector, workspaceName }: AppShellInspectorProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();

  return (
    <RightAssistPanel
      description={inspector.summary}
      title={t(inspector.titleKey as I18nMessageKey)}
    >
      <Space direction="vertical" size={shellThemeTokens.shellSectionGap} style={{ width: "100%" }}>
        <Typography.Text style={shellTypographyStyles.cardTitle}>
          {t("shell.inspector.contextLabel")}
        </Typography.Text>
        <Typography.Paragraph
          style={{
            ...shellTypographyStyles.cardDescription,
            color: token.colorTextDescription,
            margin: 0
          }}
        >{`${t("shell.workspace.currentLabel")}: ${workspaceName}`}</Typography.Paragraph>
        <Typography.Text style={shellTypographyStyles.cardTitle}>能力说明</Typography.Text>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {inspector.capabilityNotes.map((note) => (
            <Typography.Paragraph
              key={note}
              style={{
                ...shellTypographyStyles.cardDescription,
                color: token.colorTextDescription,
                margin: 0
              }}
            >
              {`• ${note}`}
            </Typography.Paragraph>
          ))}
        </Space>
        <Typography.Text style={shellTypographyStyles.cardTitle}>技术对接</Typography.Text>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {inspector.integrationNotes.map((note) => (
            <Typography.Paragraph
              key={note}
              style={{
                ...shellTypographyStyles.cardDescription,
                color: token.colorTextDescription,
                margin: 0
              }}
            >
              {`• ${note}`}
            </Typography.Paragraph>
          ))}
        </Space>
      </Space>
    </RightAssistPanel>
  );
}
