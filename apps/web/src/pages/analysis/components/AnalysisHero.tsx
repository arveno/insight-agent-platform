import { Flex, Input, Space, Typography, theme } from "antd";

import {
  AppActionGroup,
  AppBaseCard,
  AppCardGrid,
  RiskBadge,
  WarningRiskBanner,
  useI18n
} from "../../../shared";
import { toRiskBadge } from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { AnalysisComponentProps } from "./analysisComponentTypes";

export function AnalysisHero({ onNavigate, viewModel }: AnalysisComponentProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();
  const primaryContext = viewModel.analysisContext[0];
  const riskBadge = toRiskBadge(t, primaryContext?.risk);
  const heroActions = [
    createRouteAction({
      disabled: true,
      iconName: "analysis",
      key: "analysis-start",
      label: t("analysis.action.start"),
      title: t("analysis.action.start.disabledReason"),
      variant: "globalPrimary"
    }),
    createRouteAction({
      iconName: "analysis",
      key: "analysis-open-with-context",
      label: t("analysis.action.openWithContext"),
      onNavigate,
      route: "analysis",
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "reports",
      key: "analysis-hero-reports",
      label: t("analysis.action.viewReports"),
      onNavigate,
      route: "reports",
      variant: "moduleEntry"
    }),
    createRouteAction({
      iconName: "trace",
      key: "analysis-hero-observability",
      label: t("analysis.action.viewTrace"),
      onNavigate,
      route: "observability",
      variant: "sourceLink"
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
        <Space direction="vertical" size={token.marginSM} style={{ maxWidth: 760 }}>
          <Typography.Text type="secondary">{t("analysis.hero.eyebrow")}</Typography.Text>
          <Space direction="vertical" size={token.marginXXS}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              {t("analysis.hero.title")}
            </Typography.Title>
            <Typography.Text type="secondary">{t("analysis.hero.description")}</Typography.Text>
          </Space>
          <Space wrap>
            {riskBadge ? <RiskBadge {...riskBadge} /> : null}
            <Typography.Text strong>{primaryContext?.value}</Typography.Text>
            <Typography.Text type="secondary">
              {t("chrome.lastUpdated")}: {viewModel.lastUpdatedAt}
            </Typography.Text>
          </Space>
        </Space>
        <AppActionGroup actions={heroActions} />
      </Flex>

      <div style={{ marginTop: token.marginLG }}>
        <AppBaseCard
          eyebrow={t("analysis.hero.inputEyebrow")}
          footerActions={<AppActionGroup actions={heroActions.slice(0, 2)} />}
          meta={
            <WarningRiskBanner
              description={t("analysis.hero.executionBoundaryDescription")}
              message={t("analysis.hero.executionBoundaryTitle")}
              riskLevel="medium"
            />
          }
          title={t("analysis.hero.inputTitle")}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 5 }}
            readOnly
            value={viewModel.analysisInput.value}
          />
        </AppBaseCard>
      </div>

      <div style={{ marginTop: token.marginLG }}>
        <AppCardGrid columns={4}>
          <HeroFact label={t("analysis.hero.fact.context")} value={primaryContext?.value ?? ""} />
          <HeroFact
            label={t("analysis.hero.fact.runs")}
            value={`${viewModel.runList.length} ${t("analysis.common.countSuffix")}`}
          />
          <HeroFact
            label={t("analysis.hero.fact.evidence")}
            value={`${viewModel.evidenceEntrances.length} ${t("analysis.common.countSuffix")}`}
          />
          <HeroFact
            label={t("analysis.hero.fact.trace")}
            value={`${viewModel.traceEntrances.length} ${t("analysis.common.countSuffix")}`}
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
