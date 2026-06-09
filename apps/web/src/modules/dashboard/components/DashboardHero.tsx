import { Flex, Select, Space } from "antd";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { PageIntro } from "../../../shared/layout/containers/PageIntro";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { StatCard } from "../../../shared/ui/cards/StatCard";
import type { DashboardHeroProps } from "./dashboardComponentTypes";

export function DashboardHero({
  onNavigate,
  onTimeRangeChange,
  selectedTimeRange,
  selectedTimeRangeKey,
  viewModel
}: DashboardHeroProps) {
  const { t } = useI18n();
  const anomalyCount = viewModel.anomalyCards.length + viewModel.riskSummary.length;
  const heroActions = [
    createRouteAction({
      iconName: "analysis",
      key: "dashboard-hero-analysis",
      label: t("action.dashboardPrimaryAnalysis.label"),
      onNavigate,
      route: "analysis",
      variant: "globalPrimary"
    }),
    createRouteAction({
      iconName: "metrics",
      key: "dashboard-hero-metrics",
      label: t("dashboard.action.viewMetrics"),
      onNavigate,
      route: "metrics",
      variant: "moduleEntry"
    }),
    createRouteAction({
      iconName: "reports",
      key: "dashboard-hero-reports",
      label: t("dashboard.action.viewReports"),
      onNavigate,
      route: "reports",
      variant: "moduleEntry"
    })
  ];
  const timeRangeOptions = viewModel.timeRange.options.map((option) => ({
    label: option.label,
    value: option.key
  }));
  const heroFacts = [
    {
      key: "metrics",
      title: t("dashboard.hero.fact.metricLabel"),
      value: `${viewModel.businessStatCards.length} ${t("dashboard.hero.fact.metricCountSuffix")}`
    },
    {
      key: "risk-anomaly",
      title: t("dashboard.hero.fact.riskAnomalyLabel"),
      value: `${anomalyCount} ${t("dashboard.hero.fact.riskAnomalyCountSuffix")}`
    },
    {
      key: "evidence",
      title: t("dashboard.hero.fact.evidenceLabel"),
      value: `${viewModel.evidenceEntrances.length} ${t("dashboard.hero.fact.evidenceCountSuffix")}`
    },
    {
      key: "right-context",
      title: t("dashboard.hero.fact.rightContextLabel"),
      value: t("dashboard.hero.fact.rightContextValue")
    }
  ];

  return (
    <PageIntro
      colProps={{ md: 12, xl: 6, xs: 24 }}
      contentLayout="cards"
      description={t("dashboard.hero.description")}
      eyebrow={t("dashboard.hero.eyebrow")}
      extra={
        <DashboardHeroActions
          heroActions={heroActions}
          onTimeRangeChange={onTimeRangeChange}
          selectedTimeRangeKey={selectedTimeRangeKey}
          timeRangeOptions={timeRangeOptions}
        />
      }
      supportingText={selectedTimeRange.description}
      title={t("dashboard.hero.title")}
    >
      {heroFacts.map((fact) => (
        <StatCard key={fact.key} title={fact.title} value={fact.value} />
      ))}
    </PageIntro>
  );
}

function DashboardHeroActions({
  heroActions,
  onTimeRangeChange,
  selectedTimeRangeKey,
  timeRangeOptions
}: {
  heroActions: ReturnType<typeof createRouteAction>[];
  onTimeRangeChange: DashboardHeroProps["onTimeRangeChange"];
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
        {heroActions.map((action) => (
          <NavigationActionButton action={action} key={action.key} />
        ))}
      </Space>
    </Flex>
  );
}
