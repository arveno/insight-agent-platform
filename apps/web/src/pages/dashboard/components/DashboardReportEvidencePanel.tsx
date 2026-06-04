import { Space, Typography } from "antd";

import { AppActionGroup, AppBaseCard, useI18n } from "../../../shared";
import { toEvidenceItem } from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { DashboardReportEvidencePanelProps } from "./dashboardComponentTypes";

export function DashboardReportEvidencePanel({
  onNavigate,
  panel,
  viewModel
}: DashboardReportEvidencePanelProps) {
  const { t } = useI18n();
  const evidenceItems = viewModel.evidenceEntrances.map((item) => toEvidenceItem(t, item));

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
            <AppBaseCard
              description={t("dashboard.reportEvidence.suggestionSummary")}
              eyebrow={t("dashboard.reportEvidence.recentReportEyebrow")}
              footerActions={<AppActionGroup actions={reportActions} />}
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
          <AppBaseCard
            description={evidence.summary}
            eyebrow={t("dashboard.reportEvidence.evidenceEyebrow")}
            footerActions={<AppActionGroup actions={evidenceActions} />}
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
