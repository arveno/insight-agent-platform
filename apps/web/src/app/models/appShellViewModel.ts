import type {
  StaticActionViewModel,
  StaticPageStateCoverageViewModel,
  StaticPermissionSummaryViewModel,
  StaticReadonlyStateViewModel,
  StaticRightAssistSummaryViewModel,
  StaticRouteKey,
  StaticStatusViewModel
} from "./staticViewModelTypes";

export type AppShellNavigationItemViewModel = {
  badgeText?: string;
  disabled?: boolean;
  key: StaticRouteKey;
  label: string;
  status?: StaticStatusViewModel;
};

export type AppShellNavigationGroupViewModel = {
  items: AppShellNavigationItemViewModel[];
  key: string;
  label: string;
};

export type AppShellPreferenceViewModel = {
  key: string;
  label: string;
  value: string;
};

export type AppShellStaticViewModel = {
  currentRoute: StaticRouteKey;
  currentUser: {
    displayName: string;
    roleLabel: string;
    userId: string;
  };
  environmentSummary: {
    label: string;
    message: string;
  };
  globalFeedback: {
    message: string;
    status: "idle" | "success" | "warning" | "error";
  };
  headerActions: StaticActionViewModel[];
  localePreference: AppShellPreferenceViewModel;
  mobileNavigation: AppShellNavigationGroupViewModel[];
  navigationGroups: AppShellNavigationGroupViewModel[];
  permissionSummary: StaticPermissionSummaryViewModel;
  readonlyState: StaticReadonlyStateViewModel;
  rightAssistPanel: StaticRightAssistSummaryViewModel;
  shellState: StaticPageStateCoverageViewModel;
  themePreference: AppShellPreferenceViewModel;
  workspace: {
    businessDomainCount: number;
    memberCount: number;
    name: string;
    workspaceId: string;
  };
};
