import type { StaticRouteKey } from "../navigation/navigationTypes";

export type { StaticRouteKey } from "../navigation/navigationTypes";

export type StaticImplementationStatus = "stable" | "gap";

export type StaticRiskLevel = "none" | "low" | "medium" | "high" | "critical";

export type StaticStateKind =
  | "ready"
  | "empty"
  | "error"
  | "loading"
  | "success"
  | "risk"
  | "warning"
  | "disabled"
  | "readonly";

export type StaticActionIntent = "primary" | "secondary" | "navigation" | "readonly" | "disabled";

export type StaticActionViewModel = {
  description?: string;
  descriptionKey?: string;
  disabled?: boolean;
  gapNote?: string;
  implementationStatus?: StaticImplementationStatus;
  intent: StaticActionIntent;
  key: string;
  labelKey: string;
  targetRoute?: StaticRouteKey;
};

export type StaticTabViewModel = {
  count?: number;
  key: string;
  labelKey: string;
  status?: StaticStateKind;
};

export type StaticStatusViewModel = {
  labelKey: string;
  reason?: string;
  status: StaticStateKind;
};

export type StaticRiskViewModel = {
  level: StaticRiskLevel;
  reason?: string;
  title?: string;
  titleKey?: string;
};

export type StaticSummaryItemViewModel = {
  description?: string;
  key: string;
  label: string;
  linkTo?: StaticRouteKey;
  meta?: string;
  risk?: StaticRiskViewModel;
  status?: StaticStatusViewModel;
  value: string;
};

export type StaticStatCardViewModel = {
  evidenceCount?: number;
  key: string;
  label: string;
  risk: StaticRiskViewModel;
  status: StaticStatusViewModel;
  trendText?: string;
  valueText: string;
};

export type StaticSectionViewModel = {
  descriptionKey: string;
  key: string;
  status: StaticStatusViewModel;
  titleKey: string;
};

export type StaticEvidenceEntranceViewModel = {
  confidenceText: string;
  key: string;
  sourceId: string;
  sourceType: string;
  summary: string;
  title: string;
};

export type StaticTraceEntranceViewModel = {
  eventId: string;
  key: string;
  latencyText?: string;
  risk: StaticRiskViewModel;
  status: StaticStatusViewModel;
  title: string;
};

export type StaticReportEntranceViewModel = {
  evidenceCount: number;
  key: string;
  reportId: string;
  status: StaticStatusViewModel;
  title: string;
  updatedAt: string;
};

export type StaticDecisionViewModel = {
  actionSuggestions: string[];
  decisionId: string;
  key: string;
  risk: StaticRiskViewModel;
  status: StaticStatusViewModel;
  title: string;
};

export type StaticFeedbackEntranceViewModel = {
  key: string;
  targetId: string;
  targetType: string;
  title: string;
  types: string[];
};

export type StaticChartSeriesViewModel = {
  key: string;
  label: string;
  points: Array<{
    label: string;
    value: number;
  }>;
};

export type StaticPermissionSummaryViewModel = {
  canRead: boolean;
  disabledReasons: string[];
  visibility: "full" | "limited" | "blocked";
};

export type StaticReadonlyStateViewModel = {
  isReadonly: boolean;
  reason?: string;
};

export type StaticPageStateViewModel = {
  action?: StaticActionViewModel;
  kind: StaticStateKind;
  messageKey: string;
  titleKey: string;
};

export type StaticPageStateCoverageViewModel = {
  disabled: StaticPageStateViewModel;
  empty: StaticPageStateViewModel;
  error: StaticPageStateViewModel;
  loading: StaticPageStateViewModel;
  ready: StaticPageStateViewModel;
  risk: StaticPageStateViewModel;
  success: StaticPageStateViewModel;
  warning: StaticPageStateViewModel;
};

export type StaticRightAssistSummaryViewModel = {
  descriptionKey: string;
  evidence: StaticEvidenceEntranceViewModel[];
  key: string;
  links: StaticActionViewModel[];
  risk: StaticRiskViewModel;
  status: StaticStatusViewModel;
  titleKey: string;
  traces?: StaticTraceEntranceViewModel[];
};

export type StaticPageViewModelBase = {
  gapNote?: string;
  implementationStatus?: StaticImplementationStatus;
  lastUpdatedAt: string;
  mainSections: StaticSectionViewModel[];
  metricCards: StaticStatCardViewModel[];
  pageDescriptionKey: string;
  pageKey: StaticRouteKey;
  pageTitleKey: string;
  permissionSummary: StaticPermissionSummaryViewModel;
  primaryAction: StaticActionViewModel;
  readonlyState: StaticReadonlyStateViewModel;
  rightAssistSummary: StaticRightAssistSummaryViewModel;
  secondaryActions: StaticActionViewModel[];
  stateCoverage: StaticPageStateCoverageViewModel;
  summaryCards: StaticSummaryItemViewModel[];
};
