import type {
  StaticEvidenceEntranceViewModel,
  StaticPageStateCoverageViewModel,
  StaticPermissionSummaryViewModel,
  StaticReadonlyStateViewModel,
  StaticRightAssistSummaryViewModel,
  StaticRiskViewModel,
  StaticStatusViewModel,
  StaticTraceEntranceViewModel
} from "./staticViewModelTypes";

export const readyStatus: StaticStatusViewModel = {
  labelKey: "state.ready.default.label",
  status: "ready"
};

export const warningStatus: StaticStatusViewModel = {
  labelKey: "state.warning.gap.label",
  reason: "该字段来自 Surface Contract 的 Gap 标记，只作为静态展示状态。",
  status: "warning"
};

export const warningRisk: StaticRiskViewModel = {
  level: "medium",
  reason: "Surface Contract 标记该区域需要保留风险提示入口。",
  titleKey: "risk.medium.title"
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
    messageKey: "state.disabled.default.message",
    titleKey: "state.disabled.default.title"
  },
  empty: {
    kind: "empty",
    messageKey: "state.empty.default.message",
    titleKey: "state.empty.default.title"
  },
  error: {
    kind: "error",
    messageKey: "state.error.default.message",
    titleKey: "state.error.default.title"
  },
  loading: {
    kind: "loading",
    messageKey: "state.loading.default.message",
    titleKey: "state.loading.default.title"
  },
  ready: {
    kind: "ready",
    messageKey: "state.ready.default.message",
    titleKey: "state.ready.default.title"
  },
  risk: {
    kind: "risk",
    messageKey: "state.risk.default.message",
    titleKey: "state.risk.default.title"
  },
  success: {
    kind: "success",
    messageKey: "state.success.default.message",
    titleKey: "state.success.default.title"
  },
  warning: {
    kind: "warning",
    messageKey: "state.warning.default.message",
    titleKey: "state.warning.default.title"
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
      titleKey: "risk.low.title"
    },
    status: readyStatus,
    title: "Tool 权限检查 Trace"
  }
];

export const createRightAssistSummary = (
  key: string,
  titleKey: string,
  descriptionKey: string
): StaticRightAssistSummaryViewModel => ({
  descriptionKey,
  evidence: sharedEvidenceEntrances,
  key,
  links: [
    {
      intent: "navigation",
      key: `${key}-open-analysis`,
      labelKey: "action.openInAnalysisWithContext.label",
      targetRoute: "analysis"
    }
  ],
  risk: warningRisk,
  status: readyStatus,
  titleKey,
  traces: sharedTraceEntrances
});
