import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel
} from "../../../app/models";

export type EvaluationViewModel = StaticPageViewModelBase & {
  badCases: StaticSummaryItemViewModel[];
  datasetItems: StaticSummaryItemViewModel[];
  evaluationDatasets: StaticSummaryItemViewModel[];
  evaluationOverview: StaticSummaryItemViewModel[];
  evaluationRuns: StaticSummaryItemViewModel[];
  evaluationState: StaticPageStateViewModel;
  modelReportFeedbackReferences: StaticSummaryItemViewModel[];
  rubrics: StaticSummaryItemViewModel[];
  scoreSummary: StaticSummaryItemViewModel[];
  selectedBadCase: StaticSummaryItemViewModel;
  selectedDataset: StaticSummaryItemViewModel;
  selectedEvaluationRun: StaticSummaryItemViewModel;
  selectedRubric: StaticSummaryItemViewModel;
};
