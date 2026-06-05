import type {
  AppShellNavMode,
  AppShellRouteIntent,
  AppShellStaticViewModel,
  ModuleNavItemViewModel,
  StaticRouteKey
} from "../models";

export type AppShellNavigateOptions = {
  navMode?: AppShellNavMode;
  routeIntent?: AppShellRouteIntent;
};

export type AppShellNavigationState = {
  activeRoute: StaticRouteKey;
  analysisSearchQuery: string;
  navMode: AppShellNavMode;
  reportsSearchQuery: string;
  selectedAnalysisItemKey?: string;
  selectedReportFilterKey?: string;
  selectedReportItemKey?: string;
};

const routeIntentByRoute: Record<StaticRouteKey, AppShellRouteIntent> = {
  analysis: "main",
  dashboard: "main",
  "data-knowledge": "detail",
  evaluation: "detail",
  feedback: "detail",
  governance: "context",
  memory: "context",
  metrics: "detail",
  "model-tools": "context",
  observability: "detail",
  "platform-operations": "settings",
  reports: "main",
  settings: "settings",
  workspace: "settings"
};

function reportItemsForFilter(
  viewModel: AppShellStaticViewModel,
  filterKey: string
): ModuleNavItemViewModel[] {
  const reportItems = viewModel.leftNav.modules.reports.items;

  return reportItems.filter((item) => {
    if (!item.filterKeys || item.filterKeys.length === 0) {
      return filterKey === "all";
    }

    return item.filterKeys.includes(filterKey);
  });
}

function resolveDefaultNavMode(
  viewModel: AppShellStaticViewModel,
  route: StaticRouteKey,
  options?: AppShellNavigateOptions
): AppShellNavMode {
  if (options?.navMode === "detail") {
    const supportsDetailNav = viewModel.leftNav.detailNav.entries.some(
      (entry) => entry.route === route
    );
    if (supportsDetailNav) {
      return "detail";
    }
  }

  if (route === "analysis") {
    return "analysis";
  }

  if (route === "reports") {
    return "reports";
  }

  return "global";
}

function resolveSelectedReportItemKey(
  viewModel: AppShellStaticViewModel,
  filterKey: string,
  currentSelection?: string
) {
  const visibleItems = reportItemsForFilter(viewModel, filterKey);

  if (visibleItems.some((item) => item.key === currentSelection)) {
    return currentSelection;
  }

  return visibleItems[0]?.key;
}

export function createInitialNavigationState(
  viewModel: AppShellStaticViewModel
): AppShellNavigationState {
  const initialReportFilterKey = viewModel.leftNav.modules.reports.defaultFilterKey;

  return {
    activeRoute: viewModel.currentRoute,
    analysisSearchQuery: "",
    navMode: viewModel.leftNav.defaultNavMode,
    reportsSearchQuery: "",
    selectedAnalysisItemKey: viewModel.leftNav.modules.analysis.defaultSelectedItemKey,
    selectedReportFilterKey: initialReportFilterKey,
    selectedReportItemKey: initialReportFilterKey
      ? resolveSelectedReportItemKey(
          viewModel,
          initialReportFilterKey,
          viewModel.leftNav.modules.reports.defaultSelectedItemKey
        )
      : viewModel.leftNav.modules.reports.defaultSelectedItemKey
  };
}

export function navigateToShellRoute(
  viewModel: AppShellStaticViewModel,
  state: AppShellNavigationState,
  route: StaticRouteKey,
  options?: AppShellNavigateOptions
): AppShellNavigationState {
  const routeIntent = options?.routeIntent ?? routeIntentByRoute[route];
  const navMode = resolveDefaultNavMode(viewModel, route, {
    navMode: options?.navMode,
    routeIntent
  });

  return {
    ...state,
    activeRoute: route,
    navMode
  };
}

export function returnToGlobalNavigation(state: AppShellNavigationState): AppShellNavigationState {
  return {
    ...state,
    navMode: "global"
  };
}

export function selectAnalysisModuleItem(
  state: AppShellNavigationState,
  itemKey: string
): AppShellNavigationState {
  return {
    ...state,
    activeRoute: "analysis",
    navMode: "analysis",
    selectedAnalysisItemKey: itemKey
  };
}

export function setAnalysisSearchQuery(
  state: AppShellNavigationState,
  query: string
): AppShellNavigationState {
  return {
    ...state,
    analysisSearchQuery: query
  };
}

export function selectReportFilter(
  viewModel: AppShellStaticViewModel,
  state: AppShellNavigationState,
  filterKey: string
): AppShellNavigationState {
  return {
    ...state,
    activeRoute: "reports",
    navMode: "reports",
    selectedReportFilterKey: filterKey,
    selectedReportItemKey: resolveSelectedReportItemKey(
      viewModel,
      filterKey,
      state.selectedReportItemKey
    )
  };
}

export function selectReportModuleItem(
  state: AppShellNavigationState,
  itemKey: string
): AppShellNavigationState {
  return {
    ...state,
    activeRoute: "reports",
    navMode: "reports",
    selectedReportItemKey: itemKey
  };
}

export function setReportsSearchQuery(
  state: AppShellNavigationState,
  query: string
): AppShellNavigationState {
  return {
    ...state,
    reportsSearchQuery: query
  };
}

export function reportItemsForSelectedFilter(
  viewModel: AppShellStaticViewModel,
  selectedFilterKey?: string
): ModuleNavItemViewModel[] {
  if (!selectedFilterKey) {
    return viewModel.leftNav.modules.reports.items;
  }

  return reportItemsForFilter(viewModel, selectedFilterKey);
}
