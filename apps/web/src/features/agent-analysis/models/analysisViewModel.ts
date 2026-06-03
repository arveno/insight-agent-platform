import type {
  StaticActionViewModel,
  StaticEvidenceEntranceViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticReportEntranceViewModel,
  StaticSummaryItemViewModel,
  StaticTraceEntranceViewModel
} from "../../../app/models";

export type AnalysisViewModel = StaticPageViewModelBase & {
  analysisContext: StaticSummaryItemViewModel[];
  analysisInput: StaticSummaryItemViewModel;
  analysisState: StaticPageStateViewModel;
  approvalState: StaticSummaryItemViewModel;
  evidenceEntrances: StaticEvidenceEntranceViewModel[];
  followUpDraft: StaticActionViewModel;
  reportEntrances: StaticReportEntranceViewModel[];
  resultPreview: StaticSummaryItemViewModel[];
  retryState: StaticSummaryItemViewModel;
  runList: StaticSummaryItemViewModel[];
  runStatus: StaticSummaryItemViewModel;
  selectedRun: StaticSummaryItemViewModel;
  streamingState: StaticSummaryItemViewModel;
  traceEntrances: StaticTraceEntranceViewModel[];
};
