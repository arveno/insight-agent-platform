import type {
  StaticActionViewModel,
  StaticDecisionViewModel,
  StaticEvidenceEntranceViewModel,
  StaticFeedbackEntranceViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticReportEntranceViewModel,
  StaticSummaryItemViewModel
} from "../../../app/models";

export type ReportsViewModel = StaticPageViewModelBase & {
  actionSuggestions: string[];
  decisionSummary: StaticDecisionViewModel[];
  feedbackEntrance: StaticFeedbackEntranceViewModel;
  followUpContext: StaticActionViewModel;
  reportReader: StaticSummaryItemViewModel;
  reportSections: StaticSummaryItemViewModel[];
  reportsList: StaticReportEntranceViewModel[];
  reportsState: StaticPageStateViewModel;
  selectedReport: StaticReportEntranceViewModel;
  sourceEvidenceEntrances: StaticEvidenceEntranceViewModel[];
};
