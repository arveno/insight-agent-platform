import { Flex, Space, Typography, theme } from "antd";

import { AppActionGroup, AppCardGrid, AppIcon, RiskBadge, useI18n } from "../../../shared";
import { toRiskBadge } from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { DashboardComponentProps } from "./dashboardComponentTypes";

export function DashboardHero({ onNavigate, viewModel }: DashboardComponentProps) {
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

  return (
    <section
      style={{
        background: token.colorBgElevated,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
        padding: token.paddingLG
      }}
    >
      <Flex align="start" justify="space-between" wrap="wrap" gap={token.marginLG}>
        <Space direction="vertical" size={token.marginSM} style={{ maxWidth: 660 }}>
          <Typography.Text type="secondary">
            <AppIcon name="dashboard" variant="glyph" />
            {t("dashboard.hero.eyebrow")}
          </Typography.Text>
          <Space direction="vertical" size={token.marginXXS}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              {t("dashboard.hero.title")}
            </Typography.Title>
            <Typography.Text type="secondary">{t("dashboard.hero.description")}</Typography.Text>
          </Space>
          <Space wrap size={token.marginXS}>
            {riskBadge ? <RiskBadge {...riskBadge} /> : null}
            <Typography.Text strong>{summary?.value}</Typography.Text>
            <Typography.Text type="secondary">
              {t("dashboard.common.updatedAtPrefix")}
              {viewModel.lastUpdatedAt}
            </Typography.Text>
          </Space>
        </Space>
        <AppActionGroup actions={heroActions} />
      </Flex>
      <div style={{ marginTop: token.marginLG }}>
        <AppCardGrid columns={4}>
          <HeroFact
            label={t("dashboard.hero.fact.metricLabel")}
            value={`${viewModel.businessMetricCards.length} ${t(
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
        </AppCardGrid>
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
        minHeight: token.controlHeightLG * 2,
        padding: token.padding,
        width: "100%"
      }}
    >
      <Space direction="vertical" size={token.marginXXS}>
        <Typography.Text type="secondary">{label}</Typography.Text>
        <Typography.Text strong>{value}</Typography.Text>
      </Space>
    </div>
  );
}
