import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel
} from "../../../app/models";

export type MemoryViewModel = StaticPageViewModelBase & {
  analysisRunDecisionLinks: StaticSummaryItemViewModel[];
  memoryItems: StaticSummaryItemViewModel[];
  memoryOverview: StaticSummaryItemViewModel[];
  memoryState: StaticPageStateViewModel;
  memoryTypeFilters: StaticSummaryItemViewModel[];
  memoryUsageTrace: StaticSummaryItemViewModel[];
  relatedObjectDetail: StaticSummaryItemViewModel;
  selectedMemoryItem: StaticSummaryItemViewModel;
  selectedMemoryType: string;
};
