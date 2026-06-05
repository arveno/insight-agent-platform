import type { AppShellNavigationGroupViewModel, AppShellStaticViewModel } from "../models";
import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage
} from "./staticStateFixtures";

const currentUser = {
  displayName: "Ada Chen",
  roleLabel: "经营分析负责人",
  userId: "user-ada"
} as const;

const workspace = {
  businessDomainCount: 6,
  businessDomainLabel: "电商零售经营",
  memberCount: 18,
  name: "North Star Workspace",
  workspaceId: "workspace-north-star"
} as const;

const globalNavigationGroups: AppShellNavigationGroupViewModel[] = [
  {
    items: [
      { key: "dashboard", labelKey: "nav.dashboard", routeIntent: "main" },
      { key: "analysis", labelKey: "nav.analysis", routeIntent: "main" },
      { key: "reports", labelKey: "nav.reports", routeIntent: "main" }
    ],
    key: "main-workspace",
    labelKey: "nav.group.mainWorkspace"
  },
  {
    items: [
      { key: "metrics", labelKey: "nav.metrics", routeIntent: "detail" },
      { key: "data-knowledge", labelKey: "nav.dataKnowledge", routeIntent: "detail" }
    ],
    key: "business-assets",
    labelKey: "nav.group.businessAssets"
  },
  {
    items: [
      { key: "model-tools", labelKey: "nav.modelTools", routeIntent: "context" },
      { key: "governance", labelKey: "nav.governance", routeIntent: "context" },
      { key: "memory", labelKey: "nav.memory", routeIntent: "context" }
    ],
    key: "agent-platform",
    labelKey: "nav.group.agentPlatform"
  },
  {
    items: [
      { key: "observability", labelKey: "nav.observability", routeIntent: "detail" },
      { key: "feedback", labelKey: "nav.feedback", routeIntent: "detail" },
      { key: "evaluation", labelKey: "nav.evaluation", routeIntent: "detail" }
    ],
    key: "runtime-quality",
    labelKey: "nav.group.runtimeQuality"
  },
  {
    items: [
      { key: "platform-operations", labelKey: "nav.platformOperations", routeIntent: "settings" },
      { key: "settings", labelKey: "nav.settings", routeIntent: "settings" }
    ],
    key: "platform",
    labelKey: "nav.group.platform"
  }
];

/**
 * #118 将 AppShell / LeftNav 导航数据集中到 fixture / ViewModel，
 * 避免在组件内部散写全局导航、模块内导航和 detail nav 扩展点。
 */
export const appShellStaticViewModel: AppShellStaticViewModel = {
  currentRoute: "dashboard",
  currentUser,
  environmentSummary: {
    labelKey: "app.environment.summary.label",
    messageKey: "app.environment.summary.message"
  },
  globalFeedback: {
    messageKey: "app.globalFeedback.idle.message",
    status: "idle"
  },
  headerActions: [
    {
      intent: "navigation",
      key: "open-settings",
      labelKey: "settings",
      targetRoute: "settings"
    },
    {
      intent: "secondary",
      key: "language",
      labelKey: "language"
    },
    {
      intent: "secondary",
      key: "theme",
      labelKey: "theme"
    }
  ],
  leftNav: {
    defaultNavMode: "global",
    detailNav: {
      descriptionKey: "leftNav.detail.description",
      entries: [
        {
          contextType: "run-detail",
          descriptionKey: "leftNav.detail.entry.observability.description",
          key: "detail-observability",
          labelKey: "leftNav.detail.entry.observability.label",
          route: "observability"
        },
        {
          contextType: "evidence-detail",
          descriptionKey: "leftNav.detail.entry.dataKnowledge.description",
          key: "detail-data-knowledge",
          labelKey: "leftNav.detail.entry.dataKnowledge.label",
          route: "data-knowledge"
        },
        {
          contextType: "metric-detail",
          descriptionKey: "leftNav.detail.entry.metrics.description",
          key: "detail-metrics",
          labelKey: "leftNav.detail.entry.metrics.label",
          route: "metrics"
        },
        {
          contextType: "quality-detail",
          descriptionKey: "leftNav.detail.entry.feedback.description",
          key: "detail-feedback",
          labelKey: "leftNav.detail.entry.feedback.label",
          route: "feedback"
        }
      ],
      titleKey: "leftNav.detail.title"
    },
    globalNav: {
      groups: globalNavigationGroups
    },
    modules: {
      analysis: {
        defaultSelectedItemKey: "analysis-conversation-gmv-fall",
        descriptionKey: "leftNav.module.analysis.description",
        itemSectionDescriptionKey: "leftNav.module.analysis.sectionDescription",
        itemSectionTitleKey: "leftNav.module.analysis.sectionTitle",
        items: [
          {
            key: "analysis-conversation-gmv-fall",
            titleKey: "leftNav.module.analysis.item.gmvFall"
          },
          {
            key: "analysis-conversation-margin",
            titleKey: "leftNav.module.analysis.item.grossMargin"
          },
          {
            key: "analysis-conversation-promotion-roi",
            titleKey: "leftNav.module.analysis.item.promotionRoi"
          },
          {
            key: "analysis-conversation-blank-promotion-roi",
            titleKey: "leftNav.module.analysis.item.blankPromotionRoi"
          }
        ],
        key: "analysis",
        primaryActionLabelKey: "leftNav.module.analysis.primaryAction",
        returnLabelKey: "leftNav.module.return",
        searchPlaceholderKey: "leftNav.module.analysis.searchPlaceholder",
        titleKey: "leftNav.module.analysis.title"
      },
      reports: {
        defaultFilterKey: "all",
        defaultSelectedItemKey: "reports-item-east-gmv",
        descriptionKey: "leftNav.module.reports.description",
        filterSectionTitleKey: "leftNav.module.reports.filterSectionTitle",
        filters: [
          { key: "all", labelKey: "leftNav.module.reports.filter.all" },
          { key: "draft", labelKey: "leftNav.module.reports.filter.draft" },
          { key: "published", labelKey: "leftNav.module.reports.filter.published" },
          {
            key: "pending-feedback",
            labelKey: "leftNav.module.reports.filter.pendingFeedback"
          }
        ],
        itemSectionTitleKey: "leftNav.module.reports.sectionTitle",
        items: [
          {
            filterKeys: ["all", "draft"],
            key: "reports-item-east-gmv",
            titleKey: "leftNav.module.reports.item.eastGmv"
          },
          {
            filterKeys: ["all", "published"],
            key: "reports-item-promotion-roi-budget",
            titleKey: "leftNav.module.reports.item.promotionRoiBudget"
          },
          {
            filterKeys: ["all", "pending-feedback"],
            key: "reports-item-gross-margin-retro",
            titleKey: "leftNav.module.reports.item.grossMarginRetro"
          }
        ],
        key: "reports",
        returnLabelKey: "leftNav.module.return",
        titleKey: "leftNav.module.reports.title"
      }
    },
    workspaceContext: {
      actions: [
        {
          key: "workspace-manage",
          labelKey: "leftNav.workspace.manage",
          targetRoute: "workspace"
        },
        {
          disabled: true,
          key: "workspace-switch",
          labelKey: "leftNav.workspace.switch"
        }
      ],
      brandDescriptionKey: "leftNav.workspace.brandDescription",
      brandKickerKey: "leftNav.workspace.brandKicker",
      businessDomainLabel: workspace.businessDomainLabel,
      name: workspace.name,
      roleLabel: currentUser.roleLabel,
      workspaceId: workspace.workspaceId
    }
  },
  localePreference: {
    key: "locale",
    labelKey: "language",
    value: "zh-CN"
  },
  mobileNavigation: globalNavigationGroups,
  navigationGroups: globalNavigationGroups,
  permissionSummary: defaultPermissionSummary,
  readonlyState: defaultReadonlyState,
  rightAssistPanel: createRightAssistSummary(
    "global-right-assist",
    "app.rightAssist.global.title",
    "app.rightAssist.global.description"
  ),
  shellState: defaultStateCoverage,
  themePreference: {
    key: "theme",
    labelKey: "theme",
    value: "light"
  },
  workspace
};
