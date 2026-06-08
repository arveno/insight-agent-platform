import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { DashboardHero } from "../components/DashboardHero";
import { DashboardMetricOverview } from "../components/DashboardMetricOverview";
import { DashboardQualityPanel } from "../components/DashboardQualityPanel";
import { DashboardReportEvidenceCard } from "../components/DashboardReportEvidenceCard";
import { DashboardRiskOverview } from "../components/DashboardRiskOverview";
import type { DashboardViewModel } from "../models/dashboardViewModel";

export type DashboardSectionsProps = PageRouteProps & {
  onTimeRangeChange: (key: DashboardViewModel["timeRange"]["selectedKey"]) => void;
  selectedTimeRange: DashboardViewModel["timeRange"]["options"][number];
  selectedTimeRangeKey: DashboardViewModel["timeRange"]["selectedKey"];
  viewModel: DashboardViewModel;
};

export function DashboardSections({
  onNavigate,
  onTimeRangeChange,
  selectedTimeRange,
  selectedTimeRangeKey,
  viewModel
}: DashboardSectionsProps) {
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
    <SectionStack>
      <DashboardHero
        onNavigate={onNavigate}
        onTimeRangeChange={onTimeRangeChange}
        selectedTimeRange={selectedTimeRange}
        selectedTimeRangeKey={selectedTimeRangeKey}
        viewModel={viewModel}
      />

      <ContentSection
        colProps={{ md: 12, xs: 24 }}
        contentLayout="cards"
        eyebrow={t("dashboard.metrics.eyebrow")}
        extra={<NavigationActionButton action={openMetricsAction} />}
        title={t("dashboard.metrics.title")}
      >
        {viewModel.businessStatCards.map((metric) => (
          <DashboardMetricOverview key={metric.key} metric={metric} onNavigate={onNavigate} />
        ))}
      </ContentSection>

      <ContentSection
        colProps={{ md: 12, xs: 24 }}
        contentLayout="cards"
        eyebrow={t("dashboard.risk.eyebrow")}
        extra={<NavigationActionButton action={openGovernanceAction} />}
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
      </ContentSection>

      <ContentSection
        colProps={{ md: 12, xl: 8, xs: 24 }}
        contentLayout="cards"
        eyebrow={t("dashboard.reportEvidence.eyebrow")}
        extra={<NavigationActionButton action={openReportsAction} />}
        title={t("dashboard.reportEvidence.title")}
      >
        {viewModel.recentReports.map((report) => (
          <DashboardReportEvidenceCard
            key={report.key}
            kind="report"
            onNavigate={onNavigate}
            report={report}
          />
        ))}
        {viewModel.evidenceEntrances.map((evidence) => (
          <DashboardReportEvidenceCard
            evidence={evidence}
            key={evidence.key}
            kind="evidence"
            onNavigate={onNavigate}
          />
        ))}
      </ContentSection>

      <ContentSection
        colProps={{ md: 12, xs: 24 }}
        contentLayout="cards"
        eyebrow={t("dashboard.quality.eyebrow")}
        extra={<NavigationActionButton action={openPlatformOperationsAction} />}
        title={t("dashboard.quality.title")}
      >
        {viewModel.platformQualitySummary.map((item) => (
          <DashboardQualityPanel item={item} key={item.key} onNavigate={onNavigate} />
        ))}
      </ContentSection>
    </SectionStack>
  );
}
