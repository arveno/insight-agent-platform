import { createRightAssistSummary, defaultPermissionSummary, defaultReadonlyState, defaultStateCoverage, readyStatus, sharedEvidenceEntrances, warningRisk } from "../../../app/shell/fixtures/staticStateFixtures";
import type { DashboardViewModel } from "../models/dashboardViewModel";

export const dashboardStaticViewModel: DashboardViewModel = {
  analysisEntrances: [
    {
      descriptionKey: "action.dashboardOpenAnalysis.description",
      intent: "primary",
      key: "dashboard-open-analysis",
      labelKey: "action.dashboardOpenAnalysis.label",
      targetRoute: "analysis"
    }
  ],
  anomalyCards: [
    {
      description: "收入增速低于阈值，建议进入 Analysis 做异常追问。",
      key: "revenue-growth-anomaly",
      label: "收入增速异常",
      linkTo: "analysis",
      risk: warningRisk,
      status: readyStatus,
      value: "-3.2%"
    }
  ],
  businessMetricCards: [
    {
      evidenceCount: 4,
      key: "quarterly-revenue",
      label: "季度收入",
      risk: {
        level: "medium",
        reason: "低于目标区间，需要查看 Metrics 阈值。",
        title: "中风险"
      },
      status: readyStatus,
      trendText: "环比 -3.2%",
      valueText: "¥12.8M"
    },
    {
      evidenceCount: 3,
      key: "gross-margin",
      label: "毛利率",
      risk: {
        level: "low",
        title: "低风险"
      },
      status: readyStatus,
      trendText: "环比 +1.1%",
      valueText: "48.6%"
    }
  ],
  dashboardState: defaultStateCoverage.ready,
  dashboardSummary: [
    {
      description: "汇总经营指标、风险、报告和平台质量。",
      key: "business-health",
      label: "经营健康度",
      risk: warningRisk,
      status: readyStatus,
      value: "关注"
    }
  ],
  evidenceEntrances: sharedEvidenceEntrances,
  gapNote: "Dashboard 聚合 ViewModel 为 Surface Contract 标记的 Gap；这里只提供静态展示输入。",
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
  platformQualitySummary: [
    {
      description: "数据质量检查和运维任务只作为摘要入口展示。",
      key: "platform-quality",
      label: "平台质量",
      linkTo: "platform-operations",
      risk: warningRisk,
      status: readyStatus,
      value: "2 项需关注"
    }
  ],
  primaryAction: {
    intent: "primary",
    key: "dashboard-primary-analysis",
    labelKey: "action.dashboardPrimaryAnalysis.label",
    targetRoute: "analysis"
  },
  readonlyState: defaultReadonlyState,
  recentReports: [
    {
      evidenceCount: 5,
      key: "weekly-business-report",
      reportId: "report-weekly-business",
      status: readyStatus,
      title: "周经营分析报告",
      updatedAt: "2026-06-03T17:30:00+08:00"
    }
  ],
  rightAssistSummary: createRightAssistSummary(
    "dashboard-right-assist",
    "page.dashboard.rightAssist.title",
    "page.dashboard.rightAssist.description"
  ),
  riskSummary: [
    {
      description: "最高风险来自收入增速和数据质量摘要。",
      key: "dashboard-risk-summary",
      label: "风险摘要",
      risk: warningRisk,
      status: readyStatus,
      value: "Medium"
    }
  ],
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
  summaryCards: [
    {
      description: "经营总览只展示摘要，不计算指标。",
      key: "dashboard-summary-card",
      label: "总览状态",
      risk: warningRisk,
      status: readyStatus,
      value: "静态样例"
    }
  ],
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
  }
};
