import { Space, Typography, theme } from "antd";

import { RightAssistPanel, shellThemeTokens, type I18nMessageKey, useI18n } from "../../shared";
import type { AppShellInspectorViewModel } from "../models";

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
      <Space
        direction="vertical"
        size={shellThemeTokens.shellSectionGap}
        style={{ width: "100%" }}
      >
        <Typography.Text strong>{t("shell.inspector.contextLabel")}</Typography.Text>
        <Typography.Paragraph
          style={{ color: token.colorTextDescription, margin: 0 }}
        >{`${t("shell.workspace.currentLabel")}: ${workspaceName}`}</Typography.Paragraph>
        <Typography.Text strong>能力说明</Typography.Text>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {inspector.capabilityNotes.map((note) => (
            <Typography.Paragraph
              key={note}
              style={{ color: token.colorTextDescription, margin: 0 }}
            >
              {`• ${note}`}
            </Typography.Paragraph>
          ))}
        </Space>
      </Space>
    </RightAssistPanel>
  );
}
