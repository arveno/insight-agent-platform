import type { StaticPageStateViewModel, StaticPageViewModelBase, StaticRiskViewModel, StaticStatusViewModel } from "../../../app/models/staticViewModelTypes";

export type AnalysisComposerSuggestionViewModel = {
  key: string;
  label: string;
};

export type AnalysisComposerViewModel = {
  contextHint: string;
  helperText: string;
  initialDraft: string;
  key: string;
  placeholder: string;
  submitLabel: string;
  suggestions: AnalysisComposerSuggestionViewModel[];
  title: string;
};

export type AnalysisContextPackViewModel = {
  sourceObject: string;
  sourceRoute: string;
  stripText: string;
  systemText: string;
  timeRange: string;
  workspace: string;
};

export type AnalysisSessionSummaryViewModel = {
  contextLabel: string;
  key: string;
  risk?: StaticRiskViewModel;
  runLabel: string;
  status: StaticStatusViewModel;
  summary: string;
  title: string;
  updatedAtText: string;
};

export type AnalysisRunTraceEventType =
  | "user_input"
  | "context_bound"
  | "plan_created"
  | "permission_check"
  | "model_call"
  | "tool_call"
  | "evidence_retrieval"
  | "summary_generated"
  | "feedback_waiting"
  | "report_draft_created"
  | "error"
  | "cancelled";

export type AnalysisRunTraceEventViewModel = {
  costText?: string;
  detail: string;
  durationText?: string;
  errorType?: string;
  eventId: string;
  eventType: AnalysisRunTraceEventType;
  evidenceRefs?: string[];
  inputSummary?: string;
  key: string;
  modelName?: string;
  outputSummary?: string;
  risk?: StaticRiskViewModel;
  status: StaticStatusViewModel;
  summary: string;
  timestampText?: string;
  tokenUsageText?: string;
  toolName?: string;
  title: string;
};

export type AnalysisRunTraceViewModel = {
  costText: string;
  errorSummaryText: string;
  events: AnalysisRunTraceEventViewModel[];
  key: string;
  risk?: StaticRiskViewModel;
  runId: string;
  stageSummary: string;
  status: StaticStatusViewModel;
  tokenUsageText: string;
  totalDurationText: string;
  updatedAtText: string;
};

export type AnalysisResultSummaryViewModel = {
  actionSuggestions: string[];
  conclusion: string;
  evidenceSummary: string;
  findingBullets: string[];
  key: string;
  risk?: StaticRiskViewModel;
  status: StaticStatusViewModel;
  title: string;
};

export type AnalysisSessionDetailViewModel = {
  contextPack: AnalysisContextPackViewModel;
  followUpComposer: AnalysisComposerViewModel;
  inputComposer: AnalysisComposerViewModel;
  key: string;
  resultSummary: AnalysisResultSummaryViewModel;
  runTrace: AnalysisRunTraceViewModel;
  session: AnalysisSessionSummaryViewModel;
};

export type AnalysisViewModel = StaticPageViewModelBase & {
  analysisState: StaticPageStateViewModel;
  contextPanelNote: string;
  sessions: AnalysisSessionDetailViewModel[];
};
