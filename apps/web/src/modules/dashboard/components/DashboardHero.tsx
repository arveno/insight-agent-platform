import { Flex, Select, Space, Typography, theme } from "antd";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { shellThemeTokens } from "../../../shared/theme/tokens";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { toRiskBadge } from "../../../shared/utils/viewModelState";
import type { DashboardHeroProps } from "./dashboardComponentTypes";

export function DashboardHero({
  onNavigate,
  onTimeRangeChange,
  selectedTimeRange,
  selectedTimeRangeKey,
  viewModel
}: DashboardHeroProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();
  const summary = viewModel.dashboardSummary[0];
  const riskBadge = toRiskBadge(t, summary?.risk);
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

  return (
    <section
      style={{
        background: token.colorBgElevated,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
        padding: shellThemeTokens.panelPadding
      }}
    >
      <Flex align="start" justify="space-between" wrap="wrap" gap={token.marginLG}>
        <Space direction="vertical" size={token.marginSM} style={{ maxWidth: 660 }}>
          <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
            {t("dashboard.hero.eyebrow")}
          </Typography.Text>
          <Space direction="vertical" size={token.marginXXS}>
            <Typography.Text style={{ ...shellTypographyStyles.heroTitle, display: "block" }}>
              {t("dashboard.hero.title")}
            </Typography.Text>
            <Typography.Text type="secondary" style={shellTypographyStyles.body}>
              {t("dashboard.hero.description")}
            </Typography.Text>
            <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
              {selectedTimeRange.description}
            </Typography.Text>
          </Space>
          <Space wrap size={token.marginXS}>
            {riskBadge ? <RiskBadge {...riskBadge} /> : null}
            <Typography.Text style={shellTypographyStyles.cardValue}>
              {summary?.value}
            </Typography.Text>
            <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
              {t("dashboard.common.updatedAtPrefix")}
              {viewModel.lastUpdatedAt}
            </Typography.Text>
          </Space>
        </Space>
        <Flex align="center" gap={token.marginSM} justify="flex-end" wrap="wrap">
          <Select
            aria-label="Dashboard time range"
            onChange={(value) => onTimeRangeChange(value)}
            options={timeRangeOptions}
            popupMatchSelectWidth={false}
            style={{ minWidth: 168 }}
            value={selectedTimeRangeKey}
          />
          <Flex gap={12} wrap>
            {heroActions.map((action) => (
              <NavigationActionButton action={action} key={action.key} />
            ))}
          </Flex>
        </Flex>
      </Flex>
      <div style={{ marginTop: token.marginLG }}>
        <Flex gap={16} wrap>
          <HeroFact
            label={t("dashboard.hero.fact.metricLabel")}
            value={`${viewModel.businessStatCards.length} ${t(
              "dashboard.hero.fact.metricCountSuffix"
            )}`}
          />
          <HeroFact
            label={t("dashboard.hero.fact.riskAnomalyLabel")}
            value={`${anomalyCount} ${t("dashboard.hero.fact.riskAnomalyCountSuffix")}`}
          />
          <HeroFact
            label={t("dashboard.hero.fact.evidenceLabel")}
            value={`${viewModel.evidenceEntrances.length} ${t(
              "dashboard.hero.fact.evidenceCountSuffix"
            )}`}
          />
          <HeroFact
            label={t("dashboard.hero.fact.rightContextLabel")}
            value={t("dashboard.hero.fact.rightContextValue")}
          />
        </Flex>
      </div>
    </section>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        flex: "1 1 220px",
        minHeight: token.controlHeightLG * 2,
        minWidth: 0,
        padding: shellThemeTokens.panelPadding,
        width: "100%"
      }}
    >
      <Space direction="vertical" size={token.marginXXS}>
        <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
          {label}
        </Typography.Text>
        <Typography.Text style={shellTypographyStyles.cardValue}>{value}</Typography.Text>
      </Space>
    </div>
  );
}
