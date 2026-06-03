import type {
  StaticEvidenceEntranceViewModel,
  StaticPageStateCoverageViewModel,
  StaticPermissionSummaryViewModel,
  StaticReadonlyStateViewModel,
  StaticRightAssistSummaryViewModel,
  StaticRiskViewModel,
  StaticStatusViewModel,
  StaticTraceEntranceViewModel
} from "../models";

export const readyStatus: StaticStatusViewModel = {
  label: "Ready",
  status: "ready"
};

export const warningStatus: StaticStatusViewModel = {
  label: "待确认 / Gap",
  reason: "该字段来自 Surface Contract 的 Gap 标记，只作为静态展示状态。",
  status: "warning"
};

export const warningRisk: StaticRiskViewModel = {
  level: "medium",
  reason: "Surface Contract 标记该区域需要保留风险提示入口。",
  title: "需要关注"
};

export const defaultPermissionSummary: StaticPermissionSummaryViewModel = {
  canRead: true,
  disabledReasons: ["静态 UI 阶段不执行真实写入或审批动作。"],
  visibility: "full"
};

export const defaultReadonlyState: StaticReadonlyStateViewModel = {
  isReadonly: true,
  reason: "fixture / static ViewModel 只提供展示输入，不触发真实业务执行。"
};

export const defaultStateCoverage: StaticPageStateCoverageViewModel = {
  disabled: {
    kind: "disabled",
    message: "当前入口只作为静态承接位展示。",
    title: "入口已禁用"
  },
  empty: {
    kind: "empty",
    message: "当前 Surface 没有可展示的静态数据。",
    title: "暂无数据"
  },
  error: {
    kind: "error",
    message: "静态数据层保留错误态输入，不接真实错误源。",
    title: "加载失败"
  },
  loading: {
    kind: "loading",
    message: "静态数据层保留加载态输入，不创建异步数据源。",
    title: "加载中"
  },
  ready: {
    kind: "ready",
    message: "页面静态 ViewModel 已准备就绪。",
    title: "已就绪"
  },
  risk: {
    kind: "risk",
    message: "当前区域存在需要用户关注的风险摘要。",
    title: "存在风险"
  },
  success: {
    kind: "success",
    message: "轻操作反馈已由静态 UI State 承接。",
    title: "操作已承接"
  },
  warning: {
    kind: "warning",
    message: "该提示只用于 UI Shell 阶段展示，不代表真实业务告警。",
    title: "注意"
  }
};

export const sharedEvidenceEntrances: StaticEvidenceEntranceViewModel[] = [
  {
    confidenceText: "High",
    key: "metric-revenue-evidence",
    sourceId: "source-evidence-q2-revenue",
    sourceType: "Metric / Report",
    summary: "来自核心收入指标、报告段落和数据质量摘要的静态证据入口。",
    title: "季度收入证据摘要"
  },
  {
    confidenceText: "Medium",
    key: "quality-job-evidence",
    sourceId: "source-evidence-quality-job",
    sourceType: "DataQualityCheck / Job",
    summary: "用于 Dashboard、Data & Knowledge 和 Platform Operations 的质量证据入口。",
    title: "数据质量与 Job 证据"
  }
];

export const sharedTraceEntrances: StaticTraceEntranceViewModel[] = [
  {
    eventId: "run-event-analysis-summary",
    key: "analysis-run-trace",
    latencyText: "1.8s",
    risk: warningRisk,
    status: readyStatus,
    title: "分析运行摘要 Trace"
  },
  {
    eventId: "run-event-tool-permission",
    key: "tool-permission-trace",
    latencyText: "420ms",
    risk: {
      level: "low",
      title: "低风险"
    },
    status: readyStatus,
    title: "Tool 权限检查 Trace"
  }
];

export const createRightAssistSummary = (key: string, title: string, description: string): StaticRightAssistSummaryViewModel => ({
  description,
  evidence: sharedEvidenceEntrances,
  key,
  links: [
    {
      intent: "navigation",
      key: `${key}-open-analysis`,
      label: "Open in Analysis with context",
      targetRoute: "analysis"
    }
  ],
  risk: warningRisk,
  status: readyStatus,
  title,
  traces: sharedTraceEntrances
});
