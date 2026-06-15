import type {
  AnalysisTaskContextPack,
  InspectorTreeNode,
  Metric,
  MetricContextSource,
  SourceRef
} from "@insight-agent/contracts/generated/typescript";

import type { CurrentWorkspaceBinding } from "../../../shared/workspace/CurrentWorkspaceBindingProvider";
import { createDraftAnalysisTaskOwnerRef } from "../../../shared/navigation/analysisContextPack";
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
import {
  buildMetricAnalysisContextPack,
  formatMetricBusinessDomainLabel,
  formatMetricContextSourceRoleLabel,
  formatMetricContextSourceTypeLabel,
  formatMetricDisplayValue,
  formatMetricTrendLabel
} from "../../../api/adapters/buildMetricAnalysisContextPack";
import type {
  DashboardNodeDisplayViewModel,
  DashboardSurfaceViewModel
} from "../models/dashboardViewModel";

const dashboardOwner = createDraftAnalysisTaskOwnerRef();
const defaultTimestamp = "2026-06-05T11:08:12+08:00";
const riskLevelPriority: Record<Metric["riskLevel"], number> = {
  critical: 4,
  high: 3,
  low: 1,
  medium: 2
};

function normalizePeriodKey(period: string): string {
  return period
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildMetricSourceRef(source: MetricContextSource): SourceRef {
  switch (source.sourceType) {
    case "dataTable":
      return {
        tableId: source.sourceId,
        type: "dataTable"
      };
    case "knowledgeDocument":
      return {
        knowledgeDocumentId: source.sourceId,
        type: "knowledgeDocument"
      };
    case "report":
      return {
        reportId: source.sourceId,
        type: "report"
      };
    case "sourceEvidence":
      return {
        sourceEvidenceId: source.sourceId,
        type: "sourceEvidence"
      };
  }
}

function createMetricDirectory(metrics: Metric[]): {
  metricContextPacks: Record<string, AnalysisTaskContextPack>;
  metricNodes: InspectorTreeNode[];
  nodeDisplay: Record<string, DashboardNodeDisplayViewModel>;
} {
  const metricContextPacks: Record<string, AnalysisTaskContextPack> = {};
  const nodeDisplay: Record<string, DashboardNodeDisplayViewModel> = {};
  const defaultInspectorMetricId =
    metrics.find((metric) => metric.riskLevel !== "low")?.metricId ?? metrics[0]?.metricId;
  const metricNodes = metrics.map((metric) => {
    const contextPack = buildMetricAnalysisContextPack(metric);
    const businessDomainLabel = formatMetricBusinessDomainLabel(metric.businessDomainId);
    const trendLabel = formatMetricTrendLabel(metric);
    const metricNode: InspectorTreeNode = {
      ...contextPack.root,
      chips: [businessDomainLabel, metric.period, trendLabel],
      summary: metric.description
    };

    metricContextPacks[contextPack.root.nodeId] = contextPack;
    nodeDisplay[metricNode.nodeId] = {
      defaultInspectorSelection: metric.metricId === defaultInspectorMetricId,
      risk: createMetricRiskViewModel(metric.riskLevel, metric.thresholdSummary),
      sourceRefId: metric.metricId,
      status: createMetricStatusViewModel(metric.status),
      trendText: formatMetricTrendLabel(metric),
      valueText: formatMetricDisplayValue(metric)
    };

    return metricNode;
  });

  return { metricContextPacks, metricNodes, nodeDisplay };
}

function compareMetricsByRisk(left: Metric, right: Metric): number {
  return riskLevelPriority[right.riskLevel] - riskLevelPriority[left.riskLevel];
}

function createRiskNodes(metrics: Metric[]): {
  nodeDisplay: Record<string, DashboardNodeDisplayViewModel>;
  riskNodes: InspectorTreeNode[];
} {
  const nodeDisplay: Record<string, DashboardNodeDisplayViewModel> = {};
  const riskNodes = metrics
    .filter((metric) => metric.riskLevel !== "low")
    .sort(compareMetricsByRisk)
    .map((metric) => {
      const businessDomainLabel = formatMetricBusinessDomainLabel(metric.businessDomainId);
      const trendLabel = formatMetricTrendLabel(metric);
      const riskNodeId = `dashboard-node-risk-${metric.metricId}`;

      nodeDisplay[riskNodeId] = {
        risk: createMetricRiskViewModel(metric.riskLevel, metric.thresholdSummary),
        sourceRefId: metric.metricId,
        status: createMetricStatusViewModel(metric.status),
        trendText: trendLabel,
        valueText: formatMetricDisplayValue(metric)
      };

      return {
        chips: [businessDomainLabel, metric.period, trendLabel],
        kind: "riskSignal",
        nodeId: riskNodeId,
        owner: dashboardOwner,
        role: "inputContext",
        sourceRef: {
          metricId: metric.metricId,
          type: "metric"
        },
        summary: metric.thresholdSummary,
        timeRange: {
          key: normalizePeriodKey(metric.period),
          label: metric.period
        },
        title: `${metric.name}风险`,
        value: formatMetricDisplayValue(metric)
      } satisfies InspectorTreeNode;
    });

  return { nodeDisplay, riskNodes };
}

function createReportEvidenceNodes(metrics: Metric[]): {
  nodeDisplay: Record<string, DashboardNodeDisplayViewModel>;
  reportEvidenceNodes: InspectorTreeNode[];
} {
  const nodeDisplay: Record<string, DashboardNodeDisplayViewModel> = {};
  const dedupedSources = Array.from(
    metrics
      .flatMap((metric) => metric.contextSources)
      .filter((source) => source.sourceType === "report" || source.sourceType === "sourceEvidence")
      .reduce((accumulator, source) => {
        accumulator.set(`${source.sourceType}:${source.sourceId}`, source);

        return accumulator;
      }, new Map<string, MetricContextSource>())
      .values()
  );
  const reportEvidenceNodes = dedupedSources.map((source) => {
    const nodeId = `dashboard-node-${source.sourceType}-${source.sourceId}`;

    nodeDisplay[nodeId] = {
      sourceRefId: source.sourceId
    };

    return {
      chips: [
        formatMetricContextSourceTypeLabel(source.sourceType),
        formatMetricContextSourceRoleLabel(source.role)
      ],
      kind: source.sourceType,
      nodeId,
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: buildMetricSourceRef(source),
      summary: source.summary,
      title: source.title
    } satisfies InspectorTreeNode;
  });

  return { nodeDisplay, reportEvidenceNodes };
}

function resolveLastUpdatedAt(metrics: Metric[]): string {
  return metrics
    .map((metric) => metric.updatedAt)
    .sort((left, right) => right.localeCompare(left))[0] ?? defaultTimestamp;
}

export function createDashboardViewModel(
  metrics: Metric[],
  workspaceBinding: CurrentWorkspaceBinding
): DashboardSurfaceViewModel {
  const { metricContextPacks, metricNodes, nodeDisplay: metricNodeDisplay } =
    createMetricDirectory(metrics);
  const { nodeDisplay: riskNodeDisplay, riskNodes } = createRiskNodes(metrics);
  const {
    nodeDisplay: reportEvidenceNodeDisplay,
    reportEvidenceNodes
  } = createReportEvidenceNodes(metrics);
  const lastUpdatedAt = resolveLastUpdatedAt(metrics);
  const primaryMetric = metrics[0];
  const rootSummaryMetric = primaryMetric
    ? `${primaryMetric.name} 当前值 ${formatMetricDisplayValue(primaryMetric)}。`
    : "当前 workspace 暂无共享指标。";
  const nodeDisplay: DashboardSurfaceViewModel["nodeDisplay"] = {
    ...metricNodeDisplay,
    ...riskNodeDisplay,
    ...reportEvidenceNodeDisplay,
    "dashboard-node-directory-metrics": {
      valueText: `${metricNodes.length}`
    },
    "dashboard-node-directory-report-evidence": {
      valueText: `${reportEvidenceNodes.length}`
    },
    "dashboard-node-directory-risks": {
      valueText: `${riskNodes.length}`
    }
  };

  return {
    dashboardId: "dashboard-main",
    dashboardState: defaultStateCoverage.ready,
    description: "将共享指标、风险异常和报告证据组织为可追问的业务工作台。",
    gapNote:
      "Dashboard 当前只从共享 metric source 与 contextSources 派生 Context Tree，不显示平台质量 section。",
    implementationStatus: "gap",
    lastUpdatedAt,
    mainSections: [
      {
        descriptionKey: "page.dashboard.section.businessOverview.description",
        key: "business-overview",
        status: readyStatus,
        titleKey: "page.dashboard.section.businessOverview.title"
      },
      {
        descriptionKey: "page.dashboard.section.keyMetrics.description",
        key: "key-metrics",
        status: readyStatus,
        titleKey: "page.dashboard.section.keyMetrics.title"
      },
      {
        descriptionKey: "page.dashboard.section.riskAnomaly.description",
        key: "risk-anomaly",
        status: readyStatus,
        titleKey: "page.dashboard.section.riskAnomaly.title"
      }
    ],
    metricCards: [],
    metricContextPacks,
    nodeDisplay,
    pageDescriptionKey: "page.dashboard.description",
    pageKey: "dashboard",
    pageTitleKey: "page.dashboard.title",
    permissionSummary: defaultPermissionSummary,
    primaryAction: {
      intent: "primary",
      key: "dashboard-primary-analysis",
      labelKey: "action.dashboardPrimaryAnalysis.label",
      targetRoute: "analysis"
    },
    readonlyState: defaultReadonlyState,
    rightAssistSummary: createRightAssistSummary(
      "dashboard-right-assist",
      "page.dashboard.rightAssist.title",
      "page.dashboard.rightAssist.description"
    ),
    root: {
      capturedAt: lastUpdatedAt,
      chips: [
        "Last 30 days",
        `${metricNodes.length} 个指标`,
        `${reportEvidenceNodes.length} 条证据`
      ],
      children: [
        {
          children: metricNodes,
          kind: "directory",
          nodeId: "dashboard-node-directory-metrics",
          owner: dashboardOwner,
          role: "directory",
          summary: "围绕当前经营问题最值得优先追问的共享指标。",
          title: "核心指标"
        },
        {
          children: riskNodes,
          kind: "directory",
          nodeId: "dashboard-node-directory-risks",
          owner: dashboardOwner,
          role: "directory",
          summary: "聚焦需要继续核查的真实指标风险信号。",
          title: "风险异常"
        },
        {
          children: reportEvidenceNodes,
          kind: "directory",
          nodeId: "dashboard-node-directory-report-evidence",
          owner: dashboardOwner,
          role: "directory",
          summary: "从报告和证据入口继续追问当前经营问题。",
          title: "报告与证据"
        }
      ],
      kind: "dashboardOverview",
      nodeId: "dashboard-node-root",
      owner: dashboardOwner,
      role: "inputContext",
      summary: `围绕 ${workspaceBinding.workspaceName} 当前共享指标、风险异常和报告证据继续追问。${rootSummaryMetric}`,
      timeRange: {
        key: "last_30_days",
        label: "Last 30 days"
      },
      title: "经营状态总览"
    },
    secondaryActions: [
      {
        intent: "navigation",
        key: "dashboard-open-metrics",
        labelKey: "action.dashboardOpenMetrics.label",
        targetRoute: "metrics"
      },
      {
        intent: "navigation",
        key: "dashboard-open-reports",
        labelKey: "action.dashboardOpenReports.label",
        targetRoute: "reports"
      }
    ],
    stateCoverage: defaultStateCoverage,
    summaryCards: [],
    timeRange: {
      options: [
        {
          description: "当前展示最近 12 小时内的指标摘要、异常和报告入口。",
          key: "last_12_hours",
          label: "Last 12 hours"
        },
        {
          description: "当前展示最近 7 天内的指标摘要、异常和报告入口。",
          key: "last_7_days",
          label: "Last 7 days"
        },
        {
          description: "当前展示最近 30 天内的指标摘要、异常和报告入口。",
          key: "last_30_days",
          label: "Last 30 days"
        },
        {
          description: "当前展示本季度内的指标摘要、异常和报告入口。",
          key: "this_quarter",
          label: "This quarter"
        }
      ],
      selectedKey: "last_30_days"
    },
    title: "经营状态总览"
  };
}
