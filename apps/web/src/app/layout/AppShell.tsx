import { useMemo, useState } from "react";
import { Button, Divider, Popover, Segmented, Space, Typography, theme } from "antd";

import { appShellStaticViewModel } from "../fixtures";
import type {
  AppShellNavigationGroupViewModel,
  StaticPageViewModelBase,
  StaticRouteKey
} from "../models";
import { webCompositionRoutes } from "../router/router";
import { useAppTheme } from "../theme";
import {
  createInitialNavigationState,
  navigateToShellRoute,
  reportItemsForSelectedFilter,
  returnToGlobalNavigation,
  selectAnalysisModuleItem,
  selectReportFilter,
  selectReportModuleItem,
  setAnalysisSearchQuery
} from "./appShellNavigation";
import {
  analysisStaticViewModel,
  dashboardStaticViewModel,
  dataKnowledgeStaticViewModel,
  evaluationStaticViewModel,
  feedbackStaticViewModel,
  governanceStaticViewModel,
  memoryStaticViewModel,
  metricsStaticViewModel,
  modelToolsStaticViewModel,
  observabilityStaticViewModel,
  platformOperationsStaticViewModel,
  reportsStaticViewModel,
  settingsStaticViewModel,
  workspaceStaticViewModel
} from "../../features/static-view-models";
import {
  AppIcon,
  AppShellLayout,
  HeaderBar,
  type I18nMessageKey,
  LeftNav,
  localeOptions,
  type AppLocale,
  type IconName,
  type NavigationGroup,
  type NavigationItem,
  type ThemeMode,
  useI18n
} from "../../shared";
import { RightAssistSummaryPanel } from "../../pages/_shared";

const pageViewModels: Record<StaticRouteKey, StaticPageViewModelBase> = {
  analysis: analysisStaticViewModel,
  dashboard: dashboardStaticViewModel,
  "data-knowledge": dataKnowledgeStaticViewModel,
  evaluation: evaluationStaticViewModel,
  feedback: feedbackStaticViewModel,
  governance: governanceStaticViewModel,
  memory: memoryStaticViewModel,
  metrics: metricsStaticViewModel,
  "model-tools": modelToolsStaticViewModel,
  observability: observabilityStaticViewModel,
  "platform-operations": platformOperationsStaticViewModel,
  reports: reportsStaticViewModel,
  settings: settingsStaticViewModel,
  workspace: workspaceStaticViewModel
};

const routeIconByRoute: Record<StaticRouteKey, IconName> = {
  analysis: "analysis",
  dashboard: "dashboard",
  "data-knowledge": "data",
  evaluation: "evaluation",
  feedback: "feedback",
  governance: "governance",
  memory: "memory",
  metrics: "metrics",
  "model-tools": "models",
  observability: "observability",
  "platform-operations": "operations",
  reports: "reports",
  settings: "settings",
  workspace: "workspace"
};

function translateGlobalGroups(
  groups: AppShellNavigationGroupViewModel[],
  t: ReturnType<typeof useI18n>["t"]
): NavigationGroup[] {
  const translate = (key: string) => t(key as I18nMessageKey);

  return groups.map((group) => ({
    items: group.items.map<NavigationItem>((item) => ({
      badge: item.badgeTextKey ? translate(item.badgeTextKey) : undefined,
      disabled: item.disabled,
      icon: <AppIcon name={routeIconByRoute[item.key]} variant="glyph" />,
      key: item.key,
      label: translate(item.labelKey)
    })),
    key: group.key,
    label: translate(group.labelKey)
  }));
}

export function AppShell() {
  const { locale, setLocale, t } = useI18n();
  const translate = (key: string) => t(key as I18nMessageKey);
  const { setThemeMode, themeMode } = useAppTheme();
  const { token } = theme.useToken();
  const [navigationState, setNavigationState] = useState(() =>
    createInitialNavigationState(appShellStaticViewModel)
  );

  const ActivePage = webCompositionRoutes[navigationState.activeRoute];
  const activeViewModel = pageViewModels[navigationState.activeRoute];
  const headerTitle = appShellStaticViewModel.workspace.name;
  const leftNavViewModel = appShellStaticViewModel.leftNav;
  const globalNavigationGroups = useMemo(
    () => translateGlobalGroups(leftNavViewModel.globalNav.groups, t),
    [leftNavViewModel.globalNav.groups, t]
  );
  const globalSelectableKeys = useMemo(
    () =>
      new Set(
        leftNavViewModel.globalNav.groups.flatMap((group) => group.items.map((item) => item.key))
      ),
    [leftNavViewModel.globalNav.groups]
  );
  const analysisModuleItems = useMemo(() => {
    const normalizedSearch = navigationState.analysisSearchQuery.trim().toLowerCase();
    const items = leftNavViewModel.modules.analysis.items;

    return items
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        return translate(item.titleKey).toLowerCase().includes(normalizedSearch);
      })
      .map((item) => ({
        caption: item.captionKey ? translate(item.captionKey) : undefined,
        disabled: item.disabled,
        key: item.key,
        title: translate(item.titleKey)
      }));
  }, [leftNavViewModel.modules.analysis.items, navigationState.analysisSearchQuery, translate]);
  const visibleReportItems = useMemo(() => {
    const baseItems = reportItemsForSelectedFilter(
      appShellStaticViewModel,
      navigationState.selectedReportFilterKey
    );

    return baseItems.map((item) => ({
      caption: item.captionKey ? translate(item.captionKey) : undefined,
      disabled: item.disabled,
      key: item.key,
      title: translate(item.titleKey)
    }));
  }, [navigationState.selectedReportFilterKey, translate]);
  const detailNav = useMemo(
    () => ({
      description: translate(leftNavViewModel.detailNav.descriptionKey),
      items: leftNavViewModel.detailNav.entries.map((entry) => ({
        description: translate(entry.descriptionKey),
        key: entry.key,
        label: translate(entry.labelKey)
      })),
      title: translate(leftNavViewModel.detailNav.titleKey)
    }),
    [leftNavViewModel.detailNav, translate]
  );
  const moduleNav = useMemo(() => {
    if (navigationState.navMode === "analysis") {
      return {
        description: translate(leftNavViewModel.modules.analysis.descriptionKey),
        itemSectionDescription: leftNavViewModel.modules.analysis.itemSectionDescriptionKey
          ? translate(leftNavViewModel.modules.analysis.itemSectionDescriptionKey)
          : undefined,
        itemSectionTitle: translate(leftNavViewModel.modules.analysis.itemSectionTitleKey),
        items: analysisModuleItems,
        primaryActionLabel: leftNavViewModel.modules.analysis.primaryActionLabelKey
          ? translate(leftNavViewModel.modules.analysis.primaryActionLabelKey)
          : undefined,
        returnLabel: translate(leftNavViewModel.modules.analysis.returnLabelKey),
        searchPlaceholder: leftNavViewModel.modules.analysis.searchPlaceholderKey
          ? translate(leftNavViewModel.modules.analysis.searchPlaceholderKey)
          : undefined,
        title: translate(leftNavViewModel.modules.analysis.titleKey)
      };
    }

    if (navigationState.navMode === "reports") {
      return {
        description: translate(leftNavViewModel.modules.reports.descriptionKey),
        filterSectionTitle: leftNavViewModel.modules.reports.filterSectionTitleKey
          ? translate(leftNavViewModel.modules.reports.filterSectionTitleKey)
          : undefined,
        filters:
          leftNavViewModel.modules.reports.filters?.map((filter) => ({
            key: filter.key,
            label: translate(filter.labelKey)
          })) ?? [],
        itemSectionTitle: translate(leftNavViewModel.modules.reports.itemSectionTitleKey),
        items: visibleReportItems,
        returnLabel: translate(leftNavViewModel.modules.reports.returnLabelKey),
        title: translate(leftNavViewModel.modules.reports.titleKey)
      };
    }

    return undefined;
  }, [
    analysisModuleItems,
    leftNavViewModel.modules.analysis,
    leftNavViewModel.modules.reports,
    navigationState.navMode,
    translate,
    visibleReportItems
  ]);
  const selectedDetailKey = useMemo(() => {
    if (navigationState.navMode !== "detail") {
      return undefined;
    }

    return leftNavViewModel.detailNav.entries.find(
      (entry) => entry.route === navigationState.activeRoute
    )?.key;
  }, [leftNavViewModel.detailNav.entries, navigationState.activeRoute, navigationState.navMode]);
  const selectedGlobalKey = useMemo(() => {
    if (
      navigationState.navMode !== "global" ||
      !globalSelectableKeys.has(navigationState.activeRoute)
    ) {
      return undefined;
    }

    return navigationState.activeRoute;
  }, [globalSelectableKeys, navigationState.activeRoute, navigationState.navMode]);
  const selectedModuleItemKey =
    navigationState.navMode === "analysis"
      ? navigationState.selectedAnalysisItemKey
      : navigationState.navMode === "reports"
        ? navigationState.selectedReportItemKey
        : undefined;
  const workspaceContext = useMemo(
    () => ({
      actions: leftNavViewModel.workspaceContext.actions.map((action) => ({
        disabled: action.disabled,
        key: action.key,
        label: translate(action.labelKey)
      })),
      brandDescription: translate(leftNavViewModel.workspaceContext.brandDescriptionKey),
      brandKicker: translate(leftNavViewModel.workspaceContext.brandKickerKey),
      businessDomain: leftNavViewModel.workspaceContext.businessDomainLabel,
      currentLabel: t("leftNav.workspace.currentLabel"),
      name: leftNavViewModel.workspaceContext.name,
      role: `${t("leftNav.workspace.roleLabel")} · ${leftNavViewModel.workspaceContext.roleLabel}`,
      workspaceId: `${t("leftNav.workspace.workspaceIdLabel")} · ${leftNavViewModel.workspaceContext.workspaceId}`
    }),
    [leftNavViewModel.workspaceContext, t, translate]
  );

  const userPreferenceContent = (
    <Space direction="vertical" size={12} style={{ minWidth: 240 }}>
      <Space direction="vertical" size={4}>
        <Typography.Text strong>{appShellStaticViewModel.currentUser.displayName}</Typography.Text>
        <Typography.Text type="secondary">
          {appShellStaticViewModel.currentUser.roleLabel}
        </Typography.Text>
      </Space>
      <Divider style={{ margin: 0 }} />
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Typography.Text type="secondary">{t("language")}</Typography.Text>
          <Segmented
            block
            onChange={(value) => setLocale(value as AppLocale)}
            options={localeOptions}
            value={locale}
          />
        </Space>
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Typography.Text type="secondary">{t("theme")}</Typography.Text>
          <Segmented
            block
            onChange={(value) => setThemeMode(value as ThemeMode)}
            options={[
              { label: t("themeMode.system"), value: "system" },
              { label: t("themeMode.light"), value: "light" },
              { label: t("themeMode.dark"), value: "dark" }
            ]}
            value={themeMode}
          />
        </Space>
      </Space>
    </Space>
  );

  function handleRouteNavigation(route: StaticRouteKey) {
    setNavigationState((currentState) =>
      navigateToShellRoute(appShellStaticViewModel, currentState, route)
    );
  }

  function handleWorkspaceAction(actionKey: string) {
    const action = leftNavViewModel.workspaceContext.actions.find((item) => item.key === actionKey);
    const targetRoute = action?.targetRoute;

    if (!action || action.disabled || !targetRoute) {
      return;
    }

    setNavigationState((currentState) =>
      navigateToShellRoute(appShellStaticViewModel, currentState, targetRoute)
    );
  }

  return (
    <AppShellLayout
      header={<HeaderBar title={headerTitle} />}
      leftNav={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0
          }}
        >
          <div style={{ flex: "1 1 auto", minHeight: 0 }}>
            <LeftNav
              detailNav={detailNav}
              globalGroups={globalNavigationGroups}
              moduleNav={moduleNav}
              navMode={navigationState.navMode}
              onReturnToGlobalNav={() =>
                setNavigationState((currentState) => returnToGlobalNavigation(currentState))
              }
              onSearchChange={(value) =>
                setNavigationState((currentState) => setAnalysisSearchQuery(currentState, value))
              }
              onSelectDetail={(detailKey) => {
                const entry = leftNavViewModel.detailNav.entries.find(
                  (item) => item.key === detailKey
                );

                if (!entry) {
                  return;
                }

                setNavigationState((currentState) =>
                  navigateToShellRoute(appShellStaticViewModel, currentState, entry.route, {
                    navMode: "detail",
                    routeIntent: "detail"
                  })
                );
              }}
              onSelectFilter={(filterKey) =>
                setNavigationState((currentState) =>
                  selectReportFilter(appShellStaticViewModel, currentState, filterKey)
                )
              }
              onSelectGlobal={(key) => handleRouteNavigation(key as StaticRouteKey)}
              onSelectModuleItem={(itemKey) => {
                if (navigationState.navMode === "analysis") {
                  setNavigationState((currentState) =>
                    selectAnalysisModuleItem(currentState, itemKey)
                  );
                  return;
                }

                if (navigationState.navMode === "reports") {
                  setNavigationState((currentState) =>
                    selectReportModuleItem(currentState, itemKey)
                  );
                }
              }}
              onTriggerPrimaryAction={() =>
                setNavigationState((currentState) =>
                  selectAnalysisModuleItem(
                    currentState,
                    "analysis-conversation-blank-promotion-roi"
                  )
                )
              }
              onWorkspaceAction={handleWorkspaceAction}
              searchValue={
                navigationState.navMode === "analysis"
                  ? navigationState.analysisSearchQuery
                  : undefined
              }
              selectedDetailKey={selectedDetailKey}
              selectedFilterKey={navigationState.selectedReportFilterKey}
              selectedGlobalKey={selectedGlobalKey}
              selectedModuleItemKey={selectedModuleItemKey}
              workspace={workspaceContext}
            />
          </div>
          <div
            style={{
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              flex: "0 0 auto",
              padding: token.padding
            }}
          >
            <Popover
              content={userPreferenceContent}
              placement="topLeft"
              title={t("userMenu")}
              trigger="click"
            >
              <Button block style={{ height: "auto", paddingBlock: token.paddingSM }}>
                <Space direction="vertical" size={2} style={{ width: "100%" }}>
                  <Typography.Text strong>
                    {appShellStaticViewModel.currentUser.displayName}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {appShellStaticViewModel.currentUser.roleLabel}
                  </Typography.Text>
                </Space>
              </Button>
            </Popover>
          </div>
        </div>
      }
      rightAssistPanel={
        <RightAssistSummaryPanel
          onNavigate={handleRouteNavigation}
          summary={activeViewModel.rightAssistSummary}
        />
      }
    >
      <ActivePage onNavigate={handleRouteNavigation} />
    </AppShellLayout>
  );
}
