import type {
  StaticActionViewModel,
  StaticPageStateCoverageViewModel,
  StaticPermissionSummaryViewModel,
  StaticReadonlyStateViewModel,
  StaticRightAssistSummaryViewModel,
  StaticRouteKey,
  StaticStatusViewModel
} from "./staticViewModelTypes";

export type AppShellNavMode = "global" | "analysis" | "reports" | "detail";

export type AppShellRouteIntent = "main" | "detail" | "context" | "settings";

export type NavItemViewModel = {
  badgeTextKey?: string;
  disabled?: boolean;
  key: StaticRouteKey;
  labelKey: string;
  routeIntent?: AppShellRouteIntent;
  status?: StaticStatusViewModel;
};

export type NavGroupViewModel = {
  items: NavItemViewModel[];
  key: string;
  labelKey: string;
};

export type AppShellWorkspaceActionViewModel = {
  disabled?: boolean;
  key: string;
  labelKey: string;
  targetRoute?: StaticRouteKey;
};

export type AppShellWorkspaceContextViewModel = {
  actions: AppShellWorkspaceActionViewModel[];
  brandDescriptionKey: string;
  brandKickerKey: string;
  businessDomainLabel: string;
  name: string;
  roleLabel: string;
  workspaceId: string;
};

export type ModuleNavItemViewModel = {
  captionKey?: string;
  disabled?: boolean;
  filterKeys?: string[];
  key: string;
  titleKey: string;
};

export type ModuleNavFilterViewModel = {
  key: string;
  labelKey: string;
};

export type ModuleNavViewModel = {
  defaultFilterKey?: string;
  defaultSelectedItemKey?: string;
  descriptionKey: string;
  filterSectionTitleKey?: string;
  filters?: ModuleNavFilterViewModel[];
  itemSectionDescriptionKey?: string;
  itemSectionTitleKey: string;
  items: ModuleNavItemViewModel[];
  key: Extract<AppShellNavMode, "analysis" | "reports">;
  primaryActionLabelKey?: string;
  returnLabelKey: string;
  searchPlaceholderKey?: string;
  titleKey: string;
};

export type DetailNavEntryViewModel = {
  contextType: "run-detail" | "evidence-detail" | "metric-detail" | "quality-detail";
  descriptionKey: string;
  key: string;
  labelKey: string;
  route: StaticRouteKey;
};

export type DetailNavViewModel = {
  descriptionKey: string;
  entries: DetailNavEntryViewModel[];
  titleKey: string;
};

export type LeftNavViewModel = {
  defaultNavMode: AppShellNavMode;
  detailNav: DetailNavViewModel;
  globalNav: {
    groups: NavGroupViewModel[];
  };
  modules: {
    analysis: ModuleNavViewModel;
    reports: ModuleNavViewModel;
  };
  workspaceContext: AppShellWorkspaceContextViewModel;
};

export type AppShellNavigationItemViewModel = NavItemViewModel;
export type AppShellNavigationGroupViewModel = NavGroupViewModel;

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
  leftNav: LeftNavViewModel;
  localePreference: AppShellPreferenceViewModel;
  mobileNavigation: AppShellNavigationGroupViewModel[];
  navigationGroups: AppShellNavigationGroupViewModel[];
  permissionSummary: StaticPermissionSummaryViewModel;
  readonlyState: StaticReadonlyStateViewModel;
  rightAssistPanel: StaticRightAssistSummaryViewModel;
  shellState: StaticPageStateCoverageViewModel;
  themePreference: AppShellPreferenceViewModel;
  workspace: {
    businessDomainLabel: string;
    businessDomainCount: number;
    memberCount: number;
    name: string;
    workspaceId: string;
  };
};
