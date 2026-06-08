import type { StaticPageStateViewModel, StaticPageViewModelBase, StaticSummaryItemViewModel } from "../../../app/shell/models/staticViewModelTypes";

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
