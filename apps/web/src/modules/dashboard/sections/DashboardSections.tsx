import { Col, Row } from "antd";

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
import { createDashboardReportEvidenceCards } from "../mappers/createDashboardReportEvidenceCards";
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
  const reportEvidenceCards = createDashboardReportEvidenceCards({
    evidenceEntrances: viewModel.evidenceEntrances,
    onNavigate,
    recentReports: viewModel.recentReports,
    t
  });

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
        extra={<NavigationActionButton action={openMetricsAction} />}
        title={t("dashboard.metrics.title")}
      >
        <Row gutter={[16, 16]}>
          {viewModel.businessStatCards.map((metric) => (
            <Col key={metric.key} lg={12} xs={24}>
              <DashboardMetricOverview metric={metric} onNavigate={onNavigate} />
            </Col>
          ))}
        </Row>
      </ContentSection>

      <ContentSection
        eyebrow={t("dashboard.risk.eyebrow")}
        extra={<NavigationActionButton action={openGovernanceAction} />}
        title={t("dashboard.risk.title")}
      >
        <Row gutter={[16, 16]}>
          {riskItems.map(({ isRiskSummary, item }) => (
            <Col key={item.key} lg={12} xs={24}>
              <DashboardRiskOverview
                isRiskSummary={isRiskSummary}
                item={item}
                onNavigate={onNavigate}
              />
            </Col>
          ))}
        </Row>
      </ContentSection>

      <ContentSection
        eyebrow={t("dashboard.reportEvidence.eyebrow")}
        extra={<NavigationActionButton action={openReportsAction} />}
        title={t("dashboard.reportEvidence.title")}
      >
        <Row gutter={[16, 16]}>
          {reportEvidenceCards.map((card) => (
            <Col key={card.key} lg={8} xs={24}>
              <DashboardReportEvidenceCard card={card} />
            </Col>
          ))}
        </Row>
      </ContentSection>

      <ContentSection
        eyebrow={t("dashboard.quality.eyebrow")}
        extra={<NavigationActionButton action={openPlatformOperationsAction} />}
        title={t("dashboard.quality.title")}
      >
        <Row gutter={[16, 16]}>
          {viewModel.platformQualitySummary.map((item) => (
            <Col key={item.key} lg={12} xs={24}>
              <DashboardQualityPanel item={item} onNavigate={onNavigate} />
            </Col>
          ))}
        </Row>
      </ContentSection>
    </SectionStack>
  );
}
