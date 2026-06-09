import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel
} from "../../../shared/view-model/staticViewModelTypes";

export type WorkspaceViewModel = StaticPageViewModelBase & {
  businessDomains: StaticSummaryItemViewModel[];
  members: StaticSummaryItemViewModel[];
  roles: StaticSummaryItemViewModel[];
  selectedBusinessDomain: StaticSummaryItemViewModel;
  selectedMember: StaticSummaryItemViewModel;
  selectedRole: StaticSummaryItemViewModel;
  workspaceContext: StaticSummaryItemViewModel;
  workspaceOverview: StaticSummaryItemViewModel[];
  workspaceSelectorDetail: StaticSummaryItemViewModel;
  workspaceState: StaticPageStateViewModel;
};
