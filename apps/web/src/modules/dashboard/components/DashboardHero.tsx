import { Flex, Select, Space, theme } from "antd";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentSlotLayout } from "../../../shared/layout/ContentSlotLayout";
import { PageIntro } from "../../../shared/layout/containers/PageIntro";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { shellThemeTokens } from "../../../shared/theme/tokens";
import { StatCard } from "../../../shared/ui/cards/StatCard";
import { createDashboardAnalysisContextPack } from "../mappers/createDashboardAnalysisContextPack";
import {
  selectDashboardEvidenceNodes,
  selectDashboardMetricNodes,
  selectDashboardReportNodes,
  selectDashboardRiskNodes,
} from "../models/dashboardSelectors";
import type { DashboardHeroProps } from "./dashboardComponentTypes";

export function DashboardHero({
  children,
  onNavigate,
  onTimeRangeChange,
  selectedTimeRange,
  selectedTimeRangeKey,
  viewModel
}: DashboardHeroProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();
  const metricNodes = selectDashboardMetricNodes(viewModel.root);
  const riskNodes = selectDashboardRiskNodes(viewModel.root);
  const reportNodes = selectDashboardReportNodes(viewModel.root);
  const evidenceNodes = selectDashboardEvidenceNodes(viewModel.root);
  const anomalyCount = riskNodes.length;
  const primaryAnalysisAction = createRouteAction({
    iconName: "analysis",
    key: "dashboard-hero-analysis",
    label: t("action.dashboardPrimaryAnalysis.label"),
    onNavigate,
    route: "analysis",
    routeState: {
      analysisContextNodeDisplay: viewModel.nodeDisplay,
      analysisContextPack: createDashboardAnalysisContextPack({
        suggestedPrompt: `请基于 Dashboard 当前 ${selectedTimeRange.label} 的概览，解释最值得优先追问的经营问题。`,
        viewModel
      })
    },
    variant: "globalPrimary"
  });
  const timeRangeOptions = viewModel.timeRange.options.map((option) => ({
    label: option.label,
    value: option.key
  }));
  const heroFacts = [
    {
      key: "metrics",
      title: t("dashboard.hero.fact.metricLabel"),
      value: `${metricNodes.length} ${t("dashboard.hero.fact.metricCountSuffix")}`
    },
    {
      key: "risk-anomaly",
      title: t("dashboard.hero.fact.riskAnomalyLabel"),
      value: `${anomalyCount} ${t("dashboard.hero.fact.riskAnomalyCountSuffix")}`
    },
    {
      key: "evidence",
      title: t("dashboard.hero.fact.evidenceLabel"),
      value: `${reportNodes.length + evidenceNodes.length} ${t("dashboard.hero.fact.evidenceCountSuffix")}`
    }
  ];

  return (
    <PageIntro
      contentLayout="plain"
      description={viewModel.root.summary ?? viewModel.description}
      eyebrow={t("dashboard.hero.eyebrow")}
      extra={
        <DashboardHeroActions
          onTimeRangeChange={onTimeRangeChange}
          primaryAnalysisAction={primaryAnalysisAction}
          selectedTimeRangeKey={selectedTimeRangeKey}
          timeRangeOptions={timeRangeOptions}
        />
      }
      supportingText={selectedTimeRange.description}
      title={viewModel.root.title}
    >
      <Space
        direction="vertical"
        size={shellThemeTokens.pageSectionGap}
        style={{ width: "100%" }}
      >
        <ContentSlotLayout colProps={{ md: 12, xl: 6, xs: 24 }} layout="cards">
          {heroFacts.map((fact) => (
            <StatCard key={fact.key} title={fact.title} value={fact.value} />
          ))}
        </ContentSlotLayout>
        {children ? (
          <div
            style={{
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              paddingTop: shellThemeTokens.pageSectionGap
            }}
          >
            <SectionStack>{children}</SectionStack>
          </div>
        ) : null}
      </Space>
    </PageIntro>
  );
}

function DashboardHeroActions({
  onTimeRangeChange,
  primaryAnalysisAction,
  selectedTimeRangeKey,
  timeRangeOptions
}: {
  onTimeRangeChange: DashboardHeroProps["onTimeRangeChange"];
  primaryAnalysisAction: ReturnType<typeof createRouteAction>;
  selectedTimeRangeKey: DashboardHeroProps["selectedTimeRangeKey"];
  timeRangeOptions: Array<{
    label: string;
    value: DashboardHeroProps["selectedTimeRangeKey"];
  }>;
}) {
  return (
    <Flex align="center" gap={12} justify="flex-end" wrap="wrap">
      <Select
        aria-label="Dashboard time range"
        onChange={(value) => onTimeRangeChange(value)}
        options={timeRangeOptions}
        popupMatchSelectWidth={false}
        style={{ minWidth: 168 }}
        value={selectedTimeRangeKey}
      />
      <Space size={12} wrap>
        <NavigationActionButton action={primaryAnalysisAction} />
      </Space>
    </Flex>
  );
}
