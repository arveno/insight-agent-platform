import type { DashboardViewModel } from "../../../features/static-view-models";
import { AppSection, AppSectionStack, useI18n } from "../../../shared";
import { createRouteAction, type WebPageProps } from "../../_shared";
import {
  DashboardHero,
  DashboardMetricOverview,
  DashboardQualityPanel,
  DashboardReportEvidencePanel,
  DashboardRiskOverview
} from "../components";

export type DashboardSectionsProps = WebPageProps & {
  viewModel: DashboardViewModel;
};

export function DashboardSections({ onNavigate, viewModel }: DashboardSectionsProps) {
  const { t } = useI18n();
  const openMetricsAction = createRouteAction({
    iconName: "metrics",
    key: "dashboard-section-metrics",
    label: t("dashboard.action.viewMetrics"),
    onNavigate,
    route: "metrics",
    variant: "moduleEntry"
  });
  const openGovernanceAction = createRouteAction({
    iconName: "governance",
    key: "dashboard-section-governance",
    label: t("dashboard.action.viewGovernanceRisk"),
    onNavigate,
    route: "governance",
    variant: "moduleEntry"
  });
  const openReportsAction = createRouteAction({
    iconName: "reports",
    key: "dashboard-section-reports",
    label: t("dashboard.action.viewAllReports"),
    onNavigate,
    route: "reports",
    variant: "moduleEntry"
  });
  const openPlatformOperationsAction = createRouteAction({
    iconName: "operations",
    key: "dashboard-section-platform-operations",
    label: t("dashboard.action.viewPlatformOperations"),
    onNavigate,
    route: "platform-operations",
    variant: "moduleEntry"
  });
  const riskItems = [
    ...viewModel.anomalyCards.map((item) => ({ isRiskSummary: false, item })),
    ...viewModel.riskSummary.map((item) => ({ isRiskSummary: true, item }))
  ];

  return (
    <AppSectionStack>
      <DashboardHero onNavigate={onNavigate} viewModel={viewModel} />

      <AppSection
        action={openMetricsAction}
        columns={2}
        eyebrow={t("dashboard.metrics.eyebrow")}
        iconName="metrics"
        title={t("dashboard.metrics.title")}
      >
        {viewModel.businessMetricCards.map((metric) => (
          <DashboardMetricOverview key={metric.key} metric={metric} onNavigate={onNavigate} />
        ))}
      </AppSection>

      <AppSection
        action={openGovernanceAction}
        columns={2}
        eyebrow={t("dashboard.risk.eyebrow")}
        iconName="risk"
        title={t("dashboard.risk.title")}
      >
        {riskItems.map(({ isRiskSummary, item }) => (
          <DashboardRiskOverview
            isRiskSummary={isRiskSummary}
            item={item}
            key={item.key}
            onNavigate={onNavigate}
          />
        ))}
      </AppSection>

      <AppSection
        action={openReportsAction}
        columns={2}
        eyebrow={t("dashboard.reportEvidence.eyebrow")}
        iconName="reports"
        title={t("dashboard.reportEvidence.title")}
      >
        <DashboardReportEvidencePanel
          onNavigate={onNavigate}
          panel="reports"
          viewModel={viewModel}
        />
        <DashboardReportEvidencePanel
          onNavigate={onNavigate}
          panel="evidence"
          viewModel={viewModel}
        />
      </AppSection>

      <AppSection
        action={openPlatformOperationsAction}
        columns={1}
        eyebrow={t("dashboard.quality.eyebrow")}
        iconName="operations"
        title={t("dashboard.quality.title")}
      >
        {viewModel.platformQualitySummary.map((item) => (
          <DashboardQualityPanel item={item} key={item.key} onNavigate={onNavigate} />
        ))}
      </AppSection>
    </AppSectionStack>
  );
}
