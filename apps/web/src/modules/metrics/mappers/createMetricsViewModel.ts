import type { Metric } from "@insight-agent/contracts/generated/typescript";

import {
  buildMetricAnalysisContextPack,
  formatMetricBusinessDomainLabel,
  formatMetricDisplayValue,
  formatMetricTrendLabel
} from "../../../api/adapters/buildMetricAnalysisContextPack";
import {
  createMetricRiskViewModel,
  createMetricStatusViewModel
} from "../../../shared/utils/viewModelState";
import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus
} from "../../../shared/view-model/staticStateFixtures";
import type {
  MetricAtRiskItemViewModel,
  MetricDetailViewModel,
  MetricListItemViewModel,
  MetricSummaryDistributionItemViewModel,
  MetricsViewModel,
  MetricsWorkspaceBinding
} from "../models/metricsViewModel";

export function createMetricListItems(metrics: Metric[]): MetricListItemViewModel[] {
  return metrics.map((metric) => ({
    key: metric.metricId,
    metricId: metric.metricId,
    metricName: metric.name
  }));
}

function mapMetricToDetailViewModel(metric: Metric): MetricDetailViewModel {
  return {
    analysisContextPack: buildMetricAnalysisContextPack(metric),
    businessDomainId: metric.businessDomainId,
    businessDomainLabel: formatMetricBusinessDomainLabel(metric.businessDomainId),
    contextSources: metric.contextSources.map((source) => ({
      description: source.summary,
      key: source.metricContextSourceId,
      meta: `${source.sourceType} · ${source.role}`,
      title: source.title
    })),
    currentValue: formatMetricDisplayValue(metric),
    definition: metric.description,
    formulaSummary: metric.formulaSummary,
    key: metric.metricId,
    metricId: metric.metricId,
    metricName: metric.name,
    ownerTeam: metric.ownerTeam,
    period: metric.period,
    riskLevel: metric.riskLevel,
    riskView: createMetricRiskViewModel(metric.riskLevel, metric.thresholdSummary),
    status: metric.status,
    statusView: createMetricStatusViewModel(metric.status),
    thresholdSummary: metric.thresholdSummary,
    trendLabel: formatMetricTrendLabel(metric),
    updatedAt: metric.updatedAt,
    workspaceId: metric.workspaceId
  };
}

function resolveLastUpdatedAt(metrics: Metric[]): string {
  return metrics
    .map((metric) => metric.updatedAt)
    .sort((left, right) => right.localeCompare(left))[0] ?? "2026-06-05T11:08:12+08:00";
}

function countBy<T>(
  values: T[],
  keyResolver: (value: T) => string
): Map<string, number> {
  return values.reduce((accumulator, value) => {
    const key = keyResolver(value);
    accumulator.set(key, (accumulator.get(key) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());
}

function buildDistributionItems(args: {
  counts: Map<string, number>;
  labels: Array<{ key: string; label: string }>;
}): MetricSummaryDistributionItemViewModel[] {
  return args.labels.map(({ key, label }) => ({
    key,
    label,
    value: String(args.counts.get(key) ?? 0)
  }));
}

function buildAtRiskMetrics(metrics: Metric[]): MetricAtRiskItemViewModel[] {
  return metrics
    .filter((metric) => metric.riskLevel !== "low")
    .map((metric) => ({
      currentValue: formatMetricDisplayValue(metric),
      key: metric.metricId,
      metricId: metric.metricId,
      metricName: metric.name,
      riskView: createMetricRiskViewModel(metric.riskLevel, metric.thresholdSummary),
      statusView: createMetricStatusViewModel(metric.status),
      thresholdSummary: metric.thresholdSummary
    }));
}

export function createMetricsViewModel(args: {
  metrics: Metric[];
  selectedMetric: Metric;
  workspaceBinding: MetricsWorkspaceBinding;
}): MetricsViewModel {
  const riskCounts = countBy(args.metrics, (metric) => metric.riskLevel);
  const businessDomainCounts = countBy(args.metrics, (metric) => metric.businessDomainId);
  const sourceTypeCounts = countBy(
    args.metrics.flatMap((metric) => metric.contextSources),
    (source) => source.sourceType
  );

  return {
    gapNote:
      "Metrics 页面当前只读消费共享 metric source；不提供 create/edit/delete 或公式编辑。",
    implementationStatus: "gap",
    inspector: {
      atRiskMetrics: buildAtRiskMetrics(args.metrics),
      businessDomainDistribution: buildDistributionItems({
        counts: businessDomainCounts,
        labels: Array.from(businessDomainCounts.keys())
          .sort()
          .map((businessDomainId) => ({
            key: businessDomainId,
            label: formatMetricBusinessDomainLabel(businessDomainId)
          }))
      }),
      contextSourceTypeDistribution: buildDistributionItems({
        counts: sourceTypeCounts,
        labels: [
          { key: "dataTable", label: "dataTable" },
          { key: "report", label: "report" },
          { key: "sourceEvidence", label: "sourceEvidence" },
          { key: "knowledgeDocument", label: "knowledgeDocument" }
        ]
      }),
      readonlyBoundaryItems: [
        "当前不新增指标",
        "当前不编辑公式",
        "当前不编辑阈值"
      ],
      riskDistribution: buildDistributionItems({
        counts: riskCounts,
        labels: [
          { key: "high", label: "high" },
          { key: "medium", label: "medium" },
          { key: "low", label: "low" },
          { key: "critical", label: "critical" }
        ]
      }),
      selectedTimeRangeKey: "last_30_days",
      timeRangeOptions: [
        { key: "last_30_days", label: "Last 30 days" },
        { disabled: true, key: "last_7_days", label: "Last 7 days" },
        { disabled: true, key: "quarter_to_date", label: "Quarter to date" }
      ],
      workspaceSummaryItems: [
        {
          key: "metrics-workspace",
          label: "当前 Workspace",
          value: args.workspaceBinding.workspaceName
        },
        {
          key: "metrics-count",
          label: "共享指标数",
          value: String(args.metrics.length)
        }
      ]
    },
    lastUpdatedAt: resolveLastUpdatedAt(args.metrics),
    mainSections: [
      {
        descriptionKey: "page.metrics.section.metricsOverview.description",
        key: "metrics-overview",
        status: readyStatus,
        titleKey: "page.metrics.section.metricsOverview.title"
      },
      {
        descriptionKey: "page.metrics.section.selectedMetricDetail.description",
        key: "selected-metric-detail",
        status: readyStatus,
        titleKey: "page.metrics.section.selectedMetricDetail.title"
      }
    ],
    metricCards: [],
    metrics: createMetricListItems(args.metrics),
    metricsState: defaultStateCoverage.ready,
    pageDescriptionKey: "page.metrics.description",
    pageKey: "metrics",
    pageTitleKey: "page.metrics.title",
    permissionSummary: defaultPermissionSummary,
    primaryAction: {
      intent: "primary",
      key: "metrics-open-analysis",
      labelKey: "action.metricOpenAnalysis.label",
      targetRoute: "analysis"
    },
    readonlyNotice:
      "Metrics 当前阶段只读展示共享指标语义和上下文摘要，不提供新增、编辑或真实计算。",
    readonlyState: defaultReadonlyState,
    rightAssistSummary: createRightAssistSummary(
      "metrics-right-assist",
      "page.metrics.rightAssist.title",
      "page.metrics.rightAssist.description"
    ),
    secondaryActions: [
      {
        intent: "navigation",
        key: "metrics-open-dashboard",
        labelKey: "action.metricsOpenDashboard.label",
        targetRoute: "dashboard"
      }
    ],
    selectedMetric: mapMetricToDetailViewModel(args.selectedMetric),
    stateCoverage: defaultStateCoverage,
    summaryCards: [
      {
        key: "metrics-count",
        label: "共享指标数",
        value: String(args.metrics.length)
      },
      {
        key: "metrics-workspace",
        label: "当前 Workspace",
        value: args.workspaceBinding.workspaceName
      }
    ],
    workspaceNotice: `当前 Workspace：${args.workspaceBinding.workspaceName}`
  };
}
