import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel
} from "../../../shared/view-model/staticViewModelTypes";

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
