import { Flex } from "antd";

import type { WebPageProps } from "../../../shared/navigation/navigationTypes";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { DashboardHero } from "../components/DashboardHero";
import { DashboardMetricOverview } from "../components/DashboardMetricOverview";
import { DashboardQualityPanel } from "../components/DashboardQualityPanel";
import { DashboardReportEvidencePanel } from "../components/DashboardReportEvidencePanel";
import { DashboardRiskOverview } from "../components/DashboardRiskOverview";
import type { DashboardViewModel } from "../models/dashboardViewModel";

export type DashboardSectionsProps = WebPageProps & {
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
        eyebrow={t("dashboard.metrics.eyebrow")}
        titleSuffix={<NavigationActionButton action={openMetricsAction} />}
        title={t("dashboard.metrics.title")}
      >
        <Flex gap={16} wrap>
          {viewModel.businessStatCards.map((metric) => (
            <DashboardMetricOverview key={metric.key} metric={metric} onNavigate={onNavigate} />
          ))}
        </Flex>
      </ContentSection>

      <ContentSection
        eyebrow={t("dashboard.risk.eyebrow")}
        titleSuffix={<NavigationActionButton action={openGovernanceAction} />}
        title={t("dashboard.risk.title")}
      >
        <Flex gap={16} wrap>
          {riskItems.map(({ isRiskSummary, item }) => (
            <DashboardRiskOverview
              isRiskSummary={isRiskSummary}
              item={item}
              key={item.key}
              onNavigate={onNavigate}
            />
          ))}
        </Flex>
      </ContentSection>

      <ContentSection
        eyebrow={t("dashboard.reportEvidence.eyebrow")}
        titleSuffix={<NavigationActionButton action={openReportsAction} />}
        title={t("dashboard.reportEvidence.title")}
      >
        <Flex gap={16} vertical>
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
        </Flex>
      </ContentSection>

      <ContentSection
        eyebrow={t("dashboard.quality.eyebrow")}
        titleSuffix={<NavigationActionButton action={openPlatformOperationsAction} />}
        title={t("dashboard.quality.title")}
      >
        <Flex gap={16} wrap>
          {viewModel.platformQualitySummary.map((item) => (
            <DashboardQualityPanel item={item} key={item.key} onNavigate={onNavigate} />
          ))}
        </Flex>
      </ContentSection>
    </SectionStack>
  );
}
