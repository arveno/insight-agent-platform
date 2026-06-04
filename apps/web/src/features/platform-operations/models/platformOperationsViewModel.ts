import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel,
  StaticTabViewModel
} from "../../../app/models";

export type PlatformOperationsViewModel = StaticPageViewModelBase & {
  dataQualityChecks: StaticSummaryItemViewModel[];
  deploymentStatus: StaticSummaryItemViewModel;
  detailDrawer: StaticSummaryItemViewModel;
  jobs: StaticSummaryItemViewModel[];
  jobTabs: StaticTabViewModel[];
  migrationStatus: StaticSummaryItemViewModel;
  notifications: StaticSummaryItemViewModel[];
  platformOperationsOverview: StaticSummaryItemViewModel[];
  platformOperationsState: StaticPageStateViewModel;
  selectedDataQualityCheck: StaticSummaryItemViewModel;
  selectedJob: StaticSummaryItemViewModel;
  selectedNotification: StaticSummaryItemViewModel;
  smokeTestStatus: StaticSummaryItemViewModel;
};
