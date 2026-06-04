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
  badgeTextKey?: string;
  disabled?: boolean;
  key: StaticRouteKey;
  labelKey: string;
  status?: StaticStatusViewModel;
};

export type AppShellNavigationGroupViewModel = {
  items: AppShellNavigationItemViewModel[];
  key: string;
  labelKey: string;
};

export type AppShellPreferenceViewModel = {
  key: string;
  labelKey: string;
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
    labelKey: string;
    messageKey: string;
  };
  globalFeedback: {
    messageKey: string;
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
