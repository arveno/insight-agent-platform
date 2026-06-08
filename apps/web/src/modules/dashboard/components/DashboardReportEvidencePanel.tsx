import { Flex, Space, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";

import type { DashboardReportEvidencePanelProps } from "./dashboardComponentTypes";
import { mapDashboardEvidenceItem } from "../mappers/mapDashboardEvidenceItem";

export function DashboardReportEvidencePanel({
  onNavigate,
  panel,
  viewModel
}: DashboardReportEvidencePanelProps) {
  const { t } = useI18n();
  const evidenceItems = viewModel.evidenceEntrances.map((item) => mapDashboardEvidenceItem(t, item));

  if (panel === "reports") {
    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {viewModel.recentReports.map((report) => {
          const reportActions = [
            createRouteAction({
              iconName: "reports",
              key: `${report.key}-view-report`,
              label: t("dashboard.action.viewReports"),
              onNavigate,
              route: "reports",
              variant: "objectDetail"
            }),
            createRouteAction({
              iconName: "analysis",
              key: `${report.key}-suggestions`,
              label: t("dashboard.action.viewSuggestions"),
              onNavigate,
              route: "analysis",
              variant: "objectDetail"
            }),
            createRouteAction({
              iconName: "analysis",
              key: `${report.key}-context-analysis`,
              label: t("dashboard.action.analyzeWithContext"),
              onNavigate,
              route: "analysis",
              variant: "contextPrimary"
            })
          ];

          return (
            <ContentCard
              description={t("dashboard.reportEvidence.suggestionSummary")}
              eyebrow={t("dashboard.reportEvidence.recentReportEyebrow")}
              footerActions={
                <Flex gap={12} wrap>
                  {reportActions.map((action) => (
                    <NavigationActionButton action={action} key={action.key} />
                  ))}
                </Flex>
              }
              key={report.key}
              meta={
                <Space wrap>
                  <Typography.Text type="secondary">
                    {t("dashboard.common.updatedAtPrefix")}
                    {report.updatedAt}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {report.evidenceCount} {t("dashboard.common.evidenceCountSuffix")}
                  </Typography.Text>
                </Space>
              }
              title={report.title}
            />
          );
        })}
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {evidenceItems.map((evidence) => {
        const evidenceActions = [
          createRouteAction({
            iconName: "evidence",
            key: `${evidence.key}-view-evidence`,
            label: t("dashboard.action.viewEvidence"),
            onNavigate,
            route: "reports",
            variant: "sourceLink"
          }),
          createRouteAction({
            iconName: "data",
            key: `${evidence.key}-source`,
            label: t("dashboard.action.viewDataKnowledge"),
            onNavigate,
            route: "data-knowledge",
            variant: "sourceLink"
          }),
          createRouteAction({
            iconName: "trace",
            key: `${evidence.key}-trace`,
            label: t("dashboard.action.viewTrace"),
            onNavigate,
            route: "observability",
            variant: "sourceLink"
          })
        ];

        return (
          <ContentCard
            description={evidence.summary}
            eyebrow={t("dashboard.reportEvidence.evidenceEyebrow")}
            footerActions={
              <Flex gap={12} wrap>
                {evidenceActions.map((action) => (
                  <NavigationActionButton action={action} key={action.key} />
                ))}
              </Flex>
            }
            key={evidence.key}
            meta={
              <Space wrap>
                <Typography.Text type="secondary">{evidence.sourceTypeLabel}</Typography.Text>
                {evidence.confidenceText ? (
                  <Typography.Text type="secondary">{evidence.confidenceText}</Typography.Text>
                ) : null}
              </Space>
            }
            title={evidence.title}
          />
        );
      })}
    </Space>
  );
}
