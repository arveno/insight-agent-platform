import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel
} from "../../../app/models";

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
