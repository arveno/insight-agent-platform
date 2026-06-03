import type {
  StaticActionViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel
} from "../../../app/models";

export type SettingsViewModel = StaticPageViewModelBase & {
  defaultPolicySummary: StaticSummaryItemViewModel[];
  environmentSummary: StaticSummaryItemViewModel[];
  modelRoutingDisplayEntrances: StaticActionViewModel[];
  preferenceEntrances: StaticActionViewModel[];
  securityNotices: StaticSummaryItemViewModel[];
  settingsOverview: StaticSummaryItemViewModel[];
  settingsState: StaticPageStateViewModel;
};
