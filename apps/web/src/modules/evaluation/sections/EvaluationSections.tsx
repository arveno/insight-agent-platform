import { Badge, Space, Typography } from "antd";

import type {
  StaticMetricCardViewModel,
  StaticSummaryItemViewModel
} from "../../../app/shell/models/staticViewModelTypes";
import { ActionBar } from "../../../app/router/RouteActionBar";
import type { WebPageProps } from "../../../app/router/pageProps";
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

import type { EvaluationViewModel } from "../models/evaluationViewModel";

export type EvaluationSectionsProps = WebPageProps & {
  viewModel: EvaluationViewModel;
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

export function EvaluationSections({ onNavigate, viewModel }: EvaluationSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <AppSection {...getStaticSectionProps(t, viewModel.mainSections[0])} useGrid={false}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {renderSummaryCards(viewModel.evaluationOverview, t)}
          <AppPropertyList
            items={[
              viewModel.selectedDataset,
              ...viewModel.evaluationDatasets,
              ...viewModel.datasetItems
            ]}
          />
          <AppPropertyList
            items={[viewModel.selectedEvaluationRun, ...viewModel.evaluationRuns]}
          />
        </Space>
      </AppSection>
      <AppSection {...getStaticSectionProps(t, viewModel.mainSections[1])} useGrid={false}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {renderMetricCards(viewModel.metricCards, t)}
          {renderSummaryCards(
            [viewModel.selectedRubric, ...viewModel.rubrics, ...viewModel.scoreSummary],
            t
          )}
          <AppPropertyList
            items={[
              viewModel.selectedBadCase,
              ...viewModel.badCases,
              ...viewModel.modelReportFeedbackReferences
            ]}
          />
          <ActionBar actions={viewModel.secondaryActions} onNavigate={onNavigate} t={t} />
        </Space>
      </AppSection>
    </Space>
  );
}
