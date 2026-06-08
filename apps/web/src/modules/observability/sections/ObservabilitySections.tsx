import { Badge, Space, Typography } from "antd";

import type {
  StaticMetricCardViewModel,
  StaticSummaryItemViewModel
} from "../../../app/shell/models/staticViewModelTypes";
import type { WebPageProps } from "../../../app/router/pageProps";
import { StaticChart } from "../../../shared/charts/StaticChart";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { AppSection } from "../../../shared/layout/sections/AppSection";
import { getStaticSectionProps } from "../../../shared/layout/sections/getStaticSectionProps";
import { AppBaseCard } from "../../../shared/ui/cards/AppBaseCard";
import { AppCardGrid } from "../../../shared/ui/cards/AppCardGrid";
import { MetricCard } from "../../../shared/ui/cards/MetricCard";
import { AppPropertyList } from "../../../shared/ui/data/AppPropertyList";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";

import { TracePanel } from "../TracePanel";
import type { ObservabilityViewModel } from "../models/observabilityViewModel";

export type ObservabilitySectionsProps = WebPageProps & {
  viewModel: ObservabilityViewModel;
};

function renderSummaryCards(
  items: StaticSummaryItemViewModel[],
  t: ReturnType<typeof useI18n>["t"]
) {
  return (
    <AppCardGrid columns={3}>
      {items.map((item) => {
        const status = toStatusTag(t, item.status);
        const risk = toRiskBadge(t, item.risk);

        return (
          <AppBaseCard
            description={item.description}
            key={item.key}
            meta={
              item.meta ? (
                <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
                  {item.meta}
                </Typography.Text>
              ) : null
            }
            tagSlot={
              status || risk ? (
                <Space wrap>
                  {status ? <StatusTag {...status} /> : null}
                  {risk ? <RiskBadge {...risk} /> : null}
                </Space>
              ) : undefined
            }
            title={item.label}
          >
            <Typography.Text style={shellTypographyStyles.cardValue}>{item.value}</Typography.Text>
          </AppBaseCard>
        );
      })}
    </AppCardGrid>
  );
}

function renderMetricCards(
  items: StaticMetricCardViewModel[],
  t: ReturnType<typeof useI18n>["t"]
) {
  return (
    <AppCardGrid columns={3}>
      {items.map((metric) => (
        <MetricCard
          evidenceSummary={
            <Space wrap>
              {metric.trendText ? (
                <Typography.Text type="secondary">{metric.trendText}</Typography.Text>
              ) : null}
              {typeof metric.evidenceCount === "number" ? (
                <Badge count={metric.evidenceCount} overflowCount={99} />
              ) : null}
            </Space>
          }
          key={metric.key}
          risk={toRiskBadge(t, metric.risk)}
          status={toStatusTag(t, metric.status)}
          title={metric.label}
          value={metric.valueText}
        />
      ))}
    </AppCardGrid>
  );
}

export function ObservabilitySections({ viewModel }: ObservabilitySectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <AppSection {...getStaticSectionProps(t, viewModel.mainSections[0])} useGrid={false}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {renderSummaryCards(viewModel.observabilityOverview, t)}
          <TracePanel
            items={[
              ...viewModel.runTraces,
              ...viewModel.modelTraces,
              ...viewModel.toolTraces,
              ...viewModel.runtimeEvents
            ]}
          />
        </Space>
      </AppSection>
      <AppSection {...getStaticSectionProps(t, viewModel.mainSections[1])} useGrid={false}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {renderMetricCards(viewModel.metricCards, t)}
          {renderSummaryCards(
            [...viewModel.costLatencySummary, ...viewModel.errorRateSummary],
            t
          )}
          <StaticChart titleKey={viewModel.mainSections[1].titleKey} />
        </Space>
      </AppSection>
      <AppSection {...getStaticSectionProps(t, viewModel.mainSections[2])} useGrid={false}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <AppPropertyList items={[viewModel.traceDetail]} />
          <TracePanel
            items={[
              viewModel.selectedRunTrace,
              viewModel.selectedModelTrace,
              viewModel.selectedToolTrace,
              viewModel.selectedRuntimeEvent
            ]}
          />
        </Space>
      </AppSection>
    </Space>
  );
}
