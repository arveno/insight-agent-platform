import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticRiskViewModel,
  StaticStatusViewModel
} from "../../../app/models";

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

export type AnalysisRunTraceEventViewModel = {
  description?: string;
  key: string;
  meta?: string;
  risk?: StaticRiskViewModel;
  status: StaticStatusViewModel;
  timestampText?: string;
  title: string;
};

export type AnalysisRunTraceViewModel = {
  events: AnalysisRunTraceEventViewModel[];
  key: string;
  risk?: StaticRiskViewModel;
  runId: string;
  stageSummary: string;
  status: StaticStatusViewModel;
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
