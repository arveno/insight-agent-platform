import type {
  StaticActionViewModel,
  StaticDecisionViewModel,
  StaticFeedbackEntranceViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticRiskViewModel
} from "../../../shared/view-model/staticViewModelTypes";

export type ReportListItemViewModel = {
  createdAt: string;
  evidenceCount: number;
  key: string;
  reportId: string;
  runId: string;
  sectionCount: number;
  sourceContext: string;
  summary: string;
  title: string;
  workspaceId: string;
};

export type ReportSectionViewModel = {
  content: string;
  evidenceSummary?: string;
  key: string;
  reportId: string;
  reportSectionId: string;
  risk?: StaticRiskViewModel;
  title: string;
};

export type ReportSourceEvidenceViewModel = {
  confidenceText: string;
  key: string;
  reportId: string;
  runId: string;
  sourceEvidenceId: string;
  sourceTypeLabel: string;
  summary: string;
  title: string;
};

export type ReportDecisionViewModel = StaticDecisionViewModel & {
  evidenceSummary?: string;
  reportId: string;
  runId: string;
};

export type ReportActionSuggestionViewModel = {
  actionSuggestionId: string;
  decisionId: string;
  key: string;
  summary: string;
};

export type ReportDetailViewModel = ReportListItemViewModel & {
  actionSuggestions: ReportActionSuggestionViewModel[];
  decisions: ReportDecisionViewModel[];
  feedbackEntrance: StaticFeedbackEntranceViewModel;
  followUpAction: StaticActionViewModel;
  sections: ReportSectionViewModel[];
  sourceEvidence: ReportSourceEvidenceViewModel[];
};

export type ReportsViewModel = StaticPageViewModelBase & {
  actionSuggestions: ReportActionSuggestionViewModel[];
  decisions: ReportDecisionViewModel[];
  feedbackEntrance: StaticFeedbackEntranceViewModel;
  followUpAction: StaticActionViewModel;
  reportSections: ReportSectionViewModel[];
  reports: ReportListItemViewModel[];
  reportsState: StaticPageStateViewModel;
  selectedReport: ReportListItemViewModel;
  sourceEvidence: ReportSourceEvidenceViewModel[];
};
