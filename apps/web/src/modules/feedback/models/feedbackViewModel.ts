import type { StaticPageStateViewModel, StaticPageViewModelBase, StaticSummaryItemViewModel } from "../../../shared/view-model/staticViewModelTypes";

export type FeedbackViewModel = StaticPageViewModelBase & {
  badCaseEntrances: StaticSummaryItemViewModel[];
  correctionDetail: StaticSummaryItemViewModel;
  feedbackDetail: StaticSummaryItemViewModel;
  feedbackItems: StaticSummaryItemViewModel[];
  feedbackOverview: StaticSummaryItemViewModel[];
  feedbackState: StaticPageStateViewModel;
  feedbackTypeFilters: StaticSummaryItemViewModel[];
  selectedFeedback: StaticSummaryItemViewModel;
  selectedFeedbackType: string;
  targetObjectContext: StaticSummaryItemViewModel;
};
