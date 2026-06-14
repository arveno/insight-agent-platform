import type { Metric } from "@insight-agent/contracts/generated/typescript";

import {
  buildMetricAnalysisContextPack,
  formatMetricBusinessDomainLabel,
  formatMetricDisplayValue,
  formatMetricTrendLabel
} from "../../../api/adapters/buildMetricAnalysisContextPack";
import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus
} from "../../../shared/view-model/staticStateFixtures";
import type {
  MetricDetailViewModel,
  MetricListItemViewModel,
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
      meta: `${source.role} · ${source.sourceType}`,
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
    status: metric.status,
    thresholdSummary: metric.thresholdSummary,
    trendLabel: formatMetricTrendLabel(metric),
    workspaceId: metric.workspaceId
  };
}

function resolveLastUpdatedAt(metrics: Metric[]): string {
  return metrics
    .map((metric) => metric.updatedAt)
    .sort((left, right) => right.localeCompare(left))[0] ?? "2026-06-05T11:08:12+08:00";
}

export function createMetricsViewModel(args: {
  metrics: Metric[];
  selectedMetric: Metric;
  workspaceBinding: MetricsWorkspaceBinding;
}): MetricsViewModel {
  return {
    gapNote:
      "Metrics 页面当前只读消费共享 metric source；不提供 create/edit/delete 或公式编辑。",
    implementationStatus: "gap",
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
