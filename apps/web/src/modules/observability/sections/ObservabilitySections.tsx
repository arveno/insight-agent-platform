import { Badge, Flex, Space, Typography } from "antd";

import type {
  StaticStatCardViewModel,
  StaticSummaryItemViewModel
} from "../../../shared/view-model/staticViewModelTypes";
import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { StaticChart } from "../../../shared/charts/StaticChart";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { getStaticSectionProps } from "../../../shared/layout/sections/getStaticSectionProps";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { StatCard } from "../../../shared/ui/cards/StatCard";
import { PropertyList } from "../../../shared/ui/lists/PropertyList";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";

import { TracePanel } from "../components/TracePanel";
import type { ObservabilityViewModel } from "../models/observabilityViewModel";

export type ObservabilitySectionsProps = PageRouteProps & {
  viewModel: ObservabilityViewModel;
};

const cardItemStyle = { flex: "1 1 280px", minWidth: 0 } as const;

function renderSummaryCards(
  items: StaticSummaryItemViewModel[],
  t: ReturnType<typeof useI18n>["t"]
) {
  return (
    <Flex gap={16} wrap>
      {items.map((item) => {
        const status = toStatusTag(t, item.status);
        const risk = toRiskBadge(t, item.risk);

        return (
          <ContentCard
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
            style={cardItemStyle}
            title={item.label}
          >
            <Typography.Text style={shellTypographyStyles.cardValue}>{item.value}</Typography.Text>
          </ContentCard>
        );
      })}
    </Flex>
  );
}

function renderStatCards(items: StaticStatCardViewModel[], t: ReturnType<typeof useI18n>["t"]) {
  return (
    <Flex gap={16} wrap>
      {items.map((metric) => (
        <StatCard
          supportingMeta={
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
          style={cardItemStyle}
          status={toStatusTag(t, metric.status)}
          title={metric.label}
          value={metric.valueText}
        />
      ))}
    </Flex>
  );
}

export function ObservabilitySections({ viewModel }: ObservabilitySectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <ContentSection {...getStaticSectionProps(t, viewModel.mainSections[0])}>
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
      </ContentSection>
      <ContentSection {...getStaticSectionProps(t, viewModel.mainSections[1])}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {renderStatCards(viewModel.metricCards, t)}
          {renderSummaryCards([...viewModel.costLatencySummary, ...viewModel.errorRateSummary], t)}
          <StaticChart titleKey={viewModel.mainSections[1].titleKey} />
        </Space>
      </ContentSection>
      <ContentSection {...getStaticSectionProps(t, viewModel.mainSections[2])}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <PropertyList items={[viewModel.traceDetail]} />
          <TracePanel
            items={[
              viewModel.selectedRunTrace,
              viewModel.selectedModelTrace,
              viewModel.selectedToolTrace,
              viewModel.selectedRuntimeEvent
            ]}
          />
        </Space>
      </ContentSection>
    </Space>
  );
}
