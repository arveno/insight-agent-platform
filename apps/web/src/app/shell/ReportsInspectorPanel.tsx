import { Space, Typography, theme } from "antd";

import type { ReportsViewModel } from "../../modules/reports/models/reportsViewModel";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { RightAssistPanel } from "../../shared/layout/shell/RightAssistPanel";
import { shellThemeTokens } from "../../shared/theme/tokens";
import { shellTypographyStyles } from "../../shared/theme/typography";

export type ReportsInspectorPanelProps = {
  reportSections: ReportsViewModel["reportSections"];
  selectedReport: ReportsViewModel["selectedReport"];
  workspaceName: string;
};

export function ReportsInspectorPanel({
  reportSections,
  selectedReport,
  workspaceName
}: ReportsInspectorPanelProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();

  return (
    <RightAssistPanel
      description={t("page.reports.rightAssist.description")}
      title={t("page.reports.rightAssist.title")}
    >
      <Space direction="vertical" size={shellThemeTokens.shellSectionGap} style={{ width: "100%" }}>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {t("reports.inspector.context.title")}
          </Typography.Text>
          <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
            {`${t("shell.workspace.currentLabel")}: ${workspaceName}`}
          </Typography.Text>
          <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
            {selectedReport.sourceContext}
          </Typography.Text>
        </Space>

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {t("reports.inspector.meta.title")}
          </Typography.Text>
          {[
            `reportId: ${selectedReport.reportId}`,
            `runId: ${selectedReport.runId}`,
            `evidence: ${selectedReport.evidenceCount}`,
            `sections: ${selectedReport.sectionCount}`,
            `createdAt: ${selectedReport.createdAt}`
          ].map((item) => (
            <Typography.Text
              key={item}
              style={{ ...shellTypographyStyles.meta, color: token.colorTextDescription }}
            >
              {item}
            </Typography.Text>
          ))}
        </Space>

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {t("reports.inspector.outline.title")}
          </Typography.Text>
          {reportSections.map((section) => (
            <Typography.Paragraph
              key={section.reportSectionId}
              style={{
                ...shellTypographyStyles.cardDescription,
                color: token.colorTextDescription,
                margin: 0
              }}
            >
              {`• ${section.title}`}
            </Typography.Paragraph>
          ))}
        </Space>
      </Space>
    </RightAssistPanel>
  );
}
