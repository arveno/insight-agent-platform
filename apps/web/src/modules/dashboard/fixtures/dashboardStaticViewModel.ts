import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { createDraftAnalysisTaskOwnerRef } from "../../../shared/navigation/analysisContextPack";
import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus
} from "../../../shared/view-model/staticStateFixtures";
import type { DashboardSurfaceViewModel } from "../models/dashboardViewModel";

const dashboardOwner = createDraftAnalysisTaskOwnerRef();

const revenueMetricNode: InspectorTreeNode = {
  nodeId: "dashboard-node-metric-revenue",
  kind: "metric",
  role: "inputContext",
  owner: dashboardOwner,
  title: "零售收入",
  summary: "季度收入低于目标区间，需要继续拆解区域、渠道与确认节奏。",
  value: "¥12.8M",
  chips: ["环比 -3.2%", "4 条证据"],
  timeRange: {
    key: "last_30_days",
    label: "Last 30 days"
  },
  sourceRef: {
    type: "metric",
    metricId: "metric-recognized-revenue"
  }
};

const grossMarginMetricNode: InspectorTreeNode = {
  nodeId: "dashboard-node-metric-gross-margin",
  kind: "metric",
  role: "inputContext",
  owner: dashboardOwner,
  title: "毛利率",
  summary: "毛利率维持低风险，但需要和收入异常一起复核促销结构影响。",
  value: "48.6%",
  chips: ["环比 +1.1%", "3 条证据"],
  timeRange: {
    key: "last_30_days",
    label: "Last 30 days"
  },
  sourceRef: {
    type: "metric",
    metricId: "metric-gross-margin"
  }
};

const revenueRiskNode: InspectorTreeNode = {
  nodeId: "dashboard-node-risk-revenue-growth",
  kind: "riskSignal",
  role: "inputContext",
  owner: dashboardOwner,
  title: "收入增速异常",
  summary: "收入增速低于阈值，建议进入 Analysis 做异常追问。",
  value: "-3.2%",
  chips: ["Medium", "Dashboard anomaly"],
  sourceRef: {
    type: "metric",
    metricId: "metric-recognized-revenue"
  }
};

const riskSummaryNode: InspectorTreeNode = {
  nodeId: "dashboard-node-risk-summary",
  kind: "riskSummary",
  role: "inputContext",
  owner: dashboardOwner,
  title: "风险摘要",
  summary: "最高风险来自收入增速和数据质量摘要。",
  value: "Medium",
  chips: ["2 项关注", "经营健康度关注"],
  disabledReason: "当前仅提供风险摘要。"
};

const weeklyReportNode: InspectorTreeNode = {
  nodeId: "dashboard-node-report-weekly-business",
  kind: "report",
  role: "inputContext",
  owner: dashboardOwner,
  title: "周经营分析报告",
  summary: "建议先核对相关证据，再带上下文继续分析。",
  chips: ["5 条证据", "更新时间 2026-06-03T17:30:00+08:00"],
  sourceRef: {
    type: "report",
    reportId: "report-weekly-business"
  }
};

const revenueEvidenceNode: InspectorTreeNode = {
  nodeId: "dashboard-node-evidence-revenue-summary",
  kind: "sourceEvidence",
  role: "inputContext",
  owner: dashboardOwner,
  title: "零售收入证据摘要",
  summary: "来自核心收入指标、报告段落和数据质量摘要的证据入口。",
  chips: ["Metric / Report", "High"],
  sourceRef: {
    type: "sourceEvidence",
    sourceEvidenceId: "source-evidence-q2-revenue"
  }
};

const qualityEvidenceNode: InspectorTreeNode = {
  nodeId: "dashboard-node-evidence-quality-job",
  kind: "sourceEvidence",
  role: "inputContext",
  owner: dashboardOwner,
  title: "数据质量与任务证据",
  summary: "来自数据质量检查和任务日志的证据入口。",
  chips: ["DataQualityCheck / Job", "Medium"],
  sourceRef: {
    type: "sourceEvidence",
    sourceEvidenceId: "source-evidence-quality-job"
  }
};

const platformQualityNode: InspectorTreeNode = {
  nodeId: "dashboard-node-platform-quality",
  kind: "platformQuality",
  role: "inputContext",
  owner: dashboardOwner,
  title: "平台质量",
  summary: "数据质量检查和运维任务会先以摘要形式呈现。",
  value: "2 项需关注",
  chips: ["Platform quality", "Evidence-ready"],
  disabledReason: "当前仅提供平台质量摘要。"
};

const metricDirectoryNode: InspectorTreeNode = {
  nodeId: "dashboard-node-directory-metrics",
  kind: "directory",
  role: "directory",
  owner: dashboardOwner,
  title: "核心指标",
  summary: "围绕当前经营问题最值得优先追问的指标。",
  children: [revenueMetricNode, grossMarginMetricNode]
};

const riskDirectoryNode: InspectorTreeNode = {
  nodeId: "dashboard-node-directory-risks",
  kind: "directory",
  role: "directory",
  owner: dashboardOwner,
  title: "风险异常",
  summary: "聚焦需要继续核查的风险信号与摘要判断。",
  children: [revenueRiskNode, riskSummaryNode]
};

const reportEvidenceDirectoryNode: InspectorTreeNode = {
  nodeId: "dashboard-node-directory-report-evidence",
  kind: "directory",
  role: "directory",
  owner: dashboardOwner,
  title: "报告与证据",
  summary: "从报告和证据入口继续追问当前经营问题。",
  children: [weeklyReportNode, revenueEvidenceNode, qualityEvidenceNode]
};

const qualityDirectoryNode: InspectorTreeNode = {
  nodeId: "dashboard-node-directory-platform-quality",
  kind: "directory",
  role: "directory",
  owner: dashboardOwner,
  title: "平台质量",
  summary: "先查看平台质量摘要，再决定是否继续追问。",
  children: [platformQualityNode]
};

export const dashboardStaticViewModel: DashboardSurfaceViewModel = {
  dashboardId: "dashboard-main",
  dashboardState: defaultStateCoverage.ready,
  description: "将核心指标、风险异常、报告证据和平台质量组织为可追问的业务工作台。",
  gapNote: "Dashboard 聚合 ViewModel 已收束为 semantic root tree；UI 只消费 root 或 root-derived selectors。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:00:00+08:00",
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
    nodeId: "dashboard-node-root",
    kind: "dashboardOverview",
    role: "inputContext",
    owner: dashboardOwner,
    title: "经营状态总览",
    summary: "围绕经营状态、风险信号、报告证据和平台质量继续追问。",
    chips: ["Last 30 days", "2 个指标", "2 条证据"],
    timeRange: {
      key: "last_30_days",
      label: "Last 30 days"
    },
    capturedAt: "2026-06-03T18:00:00+08:00",
    children: [metricDirectoryNode, riskDirectoryNode, reportEvidenceDirectoryNode, qualityDirectoryNode]
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
