import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticRiskViewModel,
  StaticRouteKey,
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

export type AnalysisContextItemViewModel = {
  description?: string;
  key: string;
  label: string;
  meta?: string;
  risk?: StaticRiskViewModel;
  status?: StaticStatusViewModel;
  value: string;
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

export type AnalysisRunOverviewViewModel = {
  key: string;
  ownerLabel: string;
  phaseLabel: string;
  risk?: StaticRiskViewModel;
  stageSummary: string;
  status: StaticStatusViewModel;
  title: string;
  toolSummary: string;
  updatedAtText: string;
};

export type AnalysisTimelineItemViewModel = {
  description?: string;
  key: string;
  meta?: string;
  risk?: StaticRiskViewModel;
  status: StaticStatusViewModel;
  timestampText?: string;
  title: string;
};

export type AnalysisEvidenceItemViewModel = {
  confidenceText: string;
  key: string;
  relatedContext?: string;
  risk?: StaticRiskViewModel;
  sourceTypeLabel: string;
  summary: string;
  title: string;
};

export type AnalysisTraceSummaryViewModel = {
  actionLabel: string;
  description: string;
  eventCountText: string;
  items: AnalysisTimelineItemViewModel[];
  key: string;
  risk?: StaticRiskViewModel;
  status: StaticStatusViewModel;
  targetRoute: StaticRouteKey;
  title: string;
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

export type AnalysisFeedbackOptionViewModel = {
  label: string;
  value: string;
};

export type AnalysisFeedbackViewModel = {
  helperText: string;
  initialValue?: string;
  options: AnalysisFeedbackOptionViewModel[];
  submitLabel: string;
  targetTitle: string;
  title: string;
};

export type AnalysisReportEntryViewModel = {
  actionLabel: string;
  description: string;
  evidenceSummary: string;
  key: string;
  targetRoute: StaticRouteKey;
  title: string;
};

export type AnalysisSessionDetailViewModel = {
  contextItems: AnalysisContextItemViewModel[];
  evidenceItems: AnalysisEvidenceItemViewModel[];
  feedback: AnalysisFeedbackViewModel;
  followUpComposer: AnalysisComposerViewModel;
  inputComposer: AnalysisComposerViewModel;
  key: string;
  planSteps: AnalysisTimelineItemViewModel[];
  reportEntry: AnalysisReportEntryViewModel;
  resultSummary: AnalysisResultSummaryViewModel;
  runOverview: AnalysisRunOverviewViewModel;
  session: AnalysisSessionSummaryViewModel;
  traceSummary: AnalysisTraceSummaryViewModel;
};

export type AnalysisViewModel = StaticPageViewModelBase & {
  analysisState: StaticPageStateViewModel;
  contextPanelNote: string;
  sessions: AnalysisSessionDetailViewModel[];
};
