import type {
  AnalysisTaskContextPack,
  InspectorTreeNode,
  Metric
} from "@insight-agent/contracts/generated/typescript";

import type { CurrentWorkspaceBinding } from "../../../shared/workspace/CurrentWorkspaceBindingProvider";
import { createDraftAnalysisTaskOwnerRef } from "../../../shared/navigation/analysisContextPack";
import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus
} from "../../../shared/view-model/staticStateFixtures";
import {
  buildMetricAnalysisContextPack,
  formatMetricDisplayValue,
  formatMetricTrendLabel
} from "../../../api/adapters/buildMetricAnalysisContextPack";
import type { DashboardSurfaceViewModel } from "../models/dashboardViewModel";

const dashboardOwner = createDraftAnalysisTaskOwnerRef();
const defaultTimestamp = "2026-06-05T11:08:12+08:00";

function humanizeMetricStatus(status: Metric["status"]): string {
  switch (status) {
    case "attention":
      return "Attention";
    case "healthy":
      return "Healthy";
    default:
      return status;
  }
}

function createMetricDirectory(metrics: Metric[]): {
  metricContextPacks: Record<string, AnalysisTaskContextPack>;
  metricNodes: InspectorTreeNode[];
} {
  const metricContextPacks: Record<string, AnalysisTaskContextPack> = {};
  const metricNodes = metrics.map((metric) => {
    const contextPack = buildMetricAnalysisContextPack(metric);
    const metricNode: InspectorTreeNode = {
      ...contextPack.root,
      description: humanizeMetricStatus(metric.status),
      summary: `${metric.thresholdSummary}，可结合公式和上下文来源继续分析。`
    };

    metricContextPacks[contextPack.root.nodeId] = contextPack;

    return metricNode;
  });

  return { metricContextPacks, metricNodes };
}

function createRiskNodes(primaryMetric: Metric | undefined): {
  riskNodes: InspectorTreeNode[];
  riskSummaryNode: InspectorTreeNode;
} {
  if (!primaryMetric) {
    return {
      riskNodes: [],
      riskSummaryNode: {
        chips: ["0 项关注", "等待当前 workspace 指标"],
        kind: "riskSummary",
        nodeId: "dashboard-node-risk-summary",
        owner: dashboardOwner,
        role: "inputContext",
        summary: "当前 workspace 尚未加载出可追问的共享指标。",
        title: "风险摘要",
        value: "暂无"
      }
    };
  }

  const trendLabel = formatMetricTrendLabel(primaryMetric);

  return {
    riskNodes: [
      {
        chips: [primaryMetric.riskLevel, primaryMetric.period],
        kind: "riskSignal",
        nodeId: "dashboard-node-risk-primary-metric",
        owner: dashboardOwner,
        role: "inputContext",
        sourceRef: {
          metricId: primaryMetric.metricId,
          type: "metric"
        },
        summary: `${primaryMetric.name} 当前 ${trendLabel}，建议进入 Analysis 继续追问。`,
        title: `${primaryMetric.name} 风险摘要`,
        value: trendLabel
      }
    ],
    riskSummaryNode: {
      chips: ["1 项关注", `风险 ${primaryMetric.riskLevel}`],
      kind: "riskSummary",
      nodeId: "dashboard-node-risk-summary",
      owner: dashboardOwner,
      role: "inputContext",
      summary: `最高优先级关注来自 ${primaryMetric.name}。`,
      title: "风险摘要",
      value: primaryMetric.riskLevel
    }
  };
}

function createReportEvidenceNodes(workspaceName: string): InspectorTreeNode[] {
  return [
    {
      chips: ["5 条证据", `Workspace ${workspaceName}`],
      kind: "report",
      nodeId: "dashboard-node-report-weekly-business",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        reportId: "report-weekly-business",
        type: "report"
      },
      summary: "建议先核对相关证据，再带上下文继续分析。",
      title: "周经营分析报告"
    },
    {
      chips: ["Metric / Report", "High"],
      kind: "sourceEvidence",
      nodeId: "dashboard-node-evidence-revenue-summary",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        sourceEvidenceId: "source-evidence-q2-revenue",
        type: "sourceEvidence"
      },
      summary: "来自核心指标和报告入口的轻量证据摘要。",
      title: "季度收入证据摘要"
    },
    {
      chips: ["DataQualityCheck / Job", "Medium"],
      kind: "sourceEvidence",
      nodeId: "dashboard-node-evidence-quality-job",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        sourceEvidenceId: "source-evidence-quality-job",
        type: "sourceEvidence"
      },
      summary: "来自数据质量检查和任务日志的轻量证据摘要。",
      title: "数据质量与任务证据"
    }
  ];
}

function createQualityNodes(): InspectorTreeNode[] {
  return [
    {
      chips: ["Platform quality", "Evidence-ready"],
      disabledReason: "当前仅提供平台质量摘要。",
      kind: "platformQuality",
      nodeId: "dashboard-node-platform-quality",
      owner: dashboardOwner,
      role: "inputContext",
      summary: "数据质量检查和运维任务会先以摘要形式呈现。",
      title: "平台质量",
      value: "2 项需关注"
    }
  ];
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
  const { metricContextPacks, metricNodes } = createMetricDirectory(metrics);
  const primaryMetric = metrics[0];
  const { riskNodes, riskSummaryNode } = createRiskNodes(primaryMetric);
  const reportEvidenceNodes = createReportEvidenceNodes(workspaceBinding.workspaceName);
  const qualityNodes = createQualityNodes();
  const lastUpdatedAt = resolveLastUpdatedAt(metrics);
  const rootSummaryMetric = primaryMetric
    ? `${primaryMetric.name} 当前值 ${formatMetricDisplayValue(primaryMetric)}。`
    : "当前 workspace 暂无共享指标。";

  return {
    dashboardId: "dashboard-main",
    dashboardState: defaultStateCoverage.ready,
    description: "将共享指标、风险摘要、报告证据和平台质量组织为可追问的业务工作台。",
    gapNote:
      "Dashboard 当前使用共享 metric source 组装指标入口，报告、证据和平台质量仍保持 lightweight context。",
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
        metrics.length > 0 ? `Top ${metricNodes.length} metrics` : "No metrics",
        `${reportEvidenceNodes.length - 1} 条证据`,
        workspaceBinding.workspaceName
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
          children: [...riskNodes, riskSummaryNode],
          kind: "directory",
          nodeId: "dashboard-node-directory-risks",
          owner: dashboardOwner,
          role: "directory",
          summary: "聚焦需要继续核查的风险信号与摘要判断。",
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
        },
        {
          children: qualityNodes,
          kind: "directory",
          nodeId: "dashboard-node-directory-platform-quality",
          owner: dashboardOwner,
          role: "directory",
          summary: "先查看平台质量摘要，再决定是否继续追问。",
          title: "平台质量"
        }
      ],
      kind: "dashboardOverview",
      nodeId: "dashboard-node-root",
      owner: dashboardOwner,
      role: "inputContext",
      summary: `围绕 ${workspaceBinding.workspaceName} 当前共享指标、风险摘要、报告证据和平台质量继续追问。${rootSummaryMetric}`,
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
