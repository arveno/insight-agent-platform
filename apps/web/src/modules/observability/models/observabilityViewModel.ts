import type { StaticPageStateViewModel, StaticPageViewModelBase, StaticSummaryItemViewModel, StaticTraceEntranceViewModel } from "../../../app/shell/models/staticViewModelTypes";

export type ObservabilityViewModel = StaticPageViewModelBase & {
  costLatencySummary: StaticSummaryItemViewModel[];
  errorRateSummary: StaticSummaryItemViewModel[];
  modelTraces: StaticTraceEntranceViewModel[];
  observabilityOverview: StaticSummaryItemViewModel[];
  observabilityState: StaticPageStateViewModel;
  runTraces: StaticTraceEntranceViewModel[];
  runtimeEvents: StaticTraceEntranceViewModel[];
  selectedModelTrace: StaticTraceEntranceViewModel;
  selectedRunTrace: StaticTraceEntranceViewModel;
  selectedRuntimeEvent: StaticTraceEntranceViewModel;
  selectedToolTrace: StaticTraceEntranceViewModel;
  toolTraces: StaticTraceEntranceViewModel[];
  traceDetail: StaticSummaryItemViewModel;
};
