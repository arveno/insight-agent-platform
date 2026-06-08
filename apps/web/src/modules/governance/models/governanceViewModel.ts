import type { StaticPageStateViewModel, StaticPageViewModelBase, StaticSummaryItemViewModel } from "../../../app/shell/models/staticViewModelTypes";

export type GovernanceViewModel = StaticPageViewModelBase & {
  auditLogs: StaticSummaryItemViewModel[];
  governanceOverview: StaticSummaryItemViewModel[];
  governancePolicyDetail: StaticSummaryItemViewModel;
  governanceState: StaticPageStateViewModel;
  permissionPolicies: StaticSummaryItemViewModel[];
  riskControls: StaticSummaryItemViewModel[];
  selectedAuditLog: StaticSummaryItemViewModel;
  selectedPermissionPolicy: StaticSummaryItemViewModel;
  selectedRiskControl: StaticSummaryItemViewModel;
  selectedToolPermission: StaticSummaryItemViewModel;
  sqlGuardSummary: StaticSummaryItemViewModel[];
  toolPermissions: StaticSummaryItemViewModel[];
};
