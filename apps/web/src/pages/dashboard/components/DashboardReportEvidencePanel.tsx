import { Space, Typography } from "antd";

import {
  AppActionGroup,
  AppCardGrid,
  AppContentCard,
  type AppActionGroupItem,
  useI18n
} from "../../../shared";
import { toEvidenceItem } from "../../_shared";
import type { DashboardComponentProps } from "./dashboardComponentTypes";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function DashboardReportEvidencePanel({ onNavigate, viewModel }: DashboardComponentProps) {
  const { t } = useI18n();
  const evidenceItems = viewModel.evidenceEntrances.map((item) => toEvidenceItem(t, item));

  return (
    <section>
      <DashboardSectionHeader
        actionIcon="reports"
        actionLabel={t("dashboard.action.viewAllReports")}
        actionRoute="reports"
        eyebrow={t("dashboard.reportEvidence.eyebrow")}
        onNavigate={onNavigate}
        title={t("dashboard.reportEvidence.title")}
      />
      <div style={{ marginTop: 16 }}>
        <AppCardGrid columns={2}>
          <Space direction="vertical" key="reports" size={16} style={{ width: "100%" }}>
            {viewModel.recentReports.map((report) => {
              const reportActions: AppActionGroupItem[] = [
                {
                  iconName: "reports",
                  key: `${report.key}-view-report`,
                  label: t("dashboard.action.viewReports"),
                  onClick: () => onNavigate?.("reports"),
                  variant: "objectDetail"
                },
                {
                  key: `${report.key}-suggestions`,
                  label: t("dashboard.action.viewSuggestions"),
                  onClick: () => onNavigate?.("analysis"),
                  variant: "objectDetail"
                },
                {
                  iconName: "analysis",
                  key: `${report.key}-context-analysis`,
                  label: t("dashboard.action.analyzeWithContext"),
                  onClick: () => onNavigate?.("analysis"),
                  variant: "contextPrimary"
                }
              ];

              return (
                <AppContentCard
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
          <Space direction="vertical" key="evidence" size={16} style={{ width: "100%" }}>
            {evidenceItems.map((evidence) => {
              const evidenceActions: AppActionGroupItem[] = [
                {
                  key: `${evidence.key}-view-evidence`,
                  label: t("dashboard.action.viewEvidence"),
                  onClick: () => onNavigate?.("reports"),
                  variant: "sourceLink"
                },
                {
                  iconName: "data",
                  key: `${evidence.key}-source`,
                  label: t("dashboard.action.viewDataKnowledge"),
                  onClick: () => onNavigate?.("data-knowledge"),
                  variant: "sourceLink"
                },
                {
                  iconName: "observability",
                  key: `${evidence.key}-trace`,
                  label: t("dashboard.action.viewTrace"),
                  onClick: () => onNavigate?.("observability"),
                  variant: "sourceLink"
                }
              ];

              return (
                <AppContentCard
                  description={evidence.summary}
                  eyebrow={t("dashboard.reportEvidence.evidenceEyebrow")}
                  footerActions={<AppActionGroup actions={evidenceActions} />}
                  key={evidence.key}
                  meta={
                    <Space wrap>
                      <Typography.Text type="secondary">{evidence.sourceTypeLabel}</Typography.Text>
                      {evidence.confidenceText ? (
                        <Typography.Text type="secondary">
                          {evidence.confidenceText}
                        </Typography.Text>
                      ) : null}
                    </Space>
                  }
                  title={evidence.title}
                />
              );
            })}
          </Space>
        </AppCardGrid>
      </div>
    </section>
  );
}
