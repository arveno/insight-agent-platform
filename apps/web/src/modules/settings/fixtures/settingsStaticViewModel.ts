import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningRisk
} from "../../../shared/view-model/staticStateFixtures";
import type { SettingsViewModel } from "../models/settingsViewModel";

export const settingsStaticViewModel: SettingsViewModel = {
  defaultPolicySummary: [
    {
      description: "默认策略入口只展示摘要，权限决策归 Governance。",
      key: "default-policy",
      label: "默认策略",
      linkTo: "governance",
      status: readyStatus,
      value: "readonly"
    }
  ],
  environmentSummary: [
    {
      description: "只展示浏览器可见环境摘要，不展示密钥。",
      key: "environment",
      label: "环境",
      risk: warningRisk,
      status: readyStatus,
      value: "production-shell"
    }
  ],
  gapNote: "Settings 聚合对象为 Gap；不保存真实偏好，不展示 secret。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:26:00+08:00",
  mainSections: [
    {
      descriptionKey: "page.settings.section.preferences.description",
      key: "preferences",
      status: readyStatus,
      titleKey: "page.settings.section.preferences.title"
    },
    {
      descriptionKey: "page.settings.section.securityPolicy.description",
      key: "security-policy",
      status: readyStatus,
      titleKey: "page.settings.section.securityPolicy.title"
    }
  ],
  metricCards: [
    {
      key: "settings-readonly",
      label: "只读配置",
      risk: warningRisk,
      status: readyStatus,
      valueText: "enabled"
    }
  ],
  modelRoutingDisplayEntrances: [
    {
      intent: "navigation",
      key: "settings-model-routing",
      labelKey: "action.settingsModelRouting.label",
      targetRoute: "model-tools"
    }
  ],
  pageDescriptionKey: "page.settings.description",
  pageKey: "settings",
  pageTitleKey: "page.settings.title",
  permissionSummary: defaultPermissionSummary,
  preferenceEntrances: [
    { intent: "secondary", key: "settings-language", labelKey: "action.settingsLanguage.label" },
    { intent: "secondary", key: "settings-theme", labelKey: "action.settingsTheme.label" }
  ],
  primaryAction: {
    disabled: true,
    intent: "disabled",
    key: "settings-save-disabled",
    labelKey: "action.settingsSaveDisabled.label",
    descriptionKey: "action.settingsSaveDisabled.description"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "settings-right-assist",
    "page.settings.rightAssist.title",
    "page.settings.rightAssist.description"
  ),
  secondaryActions: [
    {
      intent: "navigation",
      key: "settings-open-workspace",
      labelKey: "action.settingsOpenWorkspace.label",
      targetRoute: "workspace"
    }
  ],
  securityNotices: [
    {
      description: "浏览器端不得展示模型密钥、数据库连接串或向量库密钥。",
      key: "security-secret",
      label: "密钥保护",
      risk: warningRisk,
      status: readyStatus,
      value: "enabled"
    }
  ],
  settingsOverview: [
    {
      description: "Settings 只作为偏好和只读配置入口。",
      key: "settings-overview",
      label: "设置概览",
      status: readyStatus,
      value: "readonly"
    }
  ],
  settingsState: defaultStateCoverage.ready,
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "设置静态摘要。",
      key: "settings-summary",
      label: "偏好入口",
      status: readyStatus,
      value: "2"
    }
  ]
};
