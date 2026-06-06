import type { StaticPageStateViewModel, StaticPageViewModelBase, StaticRiskViewModel, StaticStatusViewModel, StaticSummaryItemViewModel } from "../../../app/models/staticViewModelTypes";

export type PlatformOperationCategory =
  | "job"
  | "data_quality"
  | "notification"
  | "deployment"
  | "smoke"
  | "migration";

export type PlatformOperationsWorkspaceBinding = {
  workspaceId: string;
  workspaceName: string;
};

export type PlatformOperationListItemViewModel = {
  category: PlatformOperationCategory;
  key: string;
  risk?: StaticRiskViewModel;
  status?: StaticStatusViewModel;
  title: string;
};

export type PlatformOperationDetailRelatedObjectViewModel = {
  key: string;
  label: string;
  value: string;
};

export type PlatformOperationDetailViewModel = {
  category: PlatformOperationCategory;
  description: string;
  impactText?: string;
  key: string;
  lastRunText?: string;
  ownerText?: string;
  relatedObjects?: PlatformOperationDetailRelatedObjectViewModel[];
  risk?: StaticRiskViewModel;
  status?: StaticStatusViewModel;
  summary: string;
  title: string;
  workspaceId: string;
};

export type PlatformOperationsViewModel = StaticPageViewModelBase & {
  operationItems: PlatformOperationListItemViewModel[];
  platformOperationsState: StaticPageStateViewModel;
  readonlyNotice: string;
  selectedOperation: PlatformOperationDetailViewModel;
  summaryCards: StaticSummaryItemViewModel[];
  workspaceBinding: PlatformOperationsWorkspaceBinding;
  workspaceNotice: string;
};
