import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningRisk
} from "../../../app/fixtures";
import type { SettingsViewModel } from "../models";

export const settingsStaticViewModel: SettingsViewModel = {
  defaultPolicySummary: [
    { description: "默认策略入口只展示摘要，权限决策归 Governance。", key: "default-policy", label: "默认策略", linkTo: "governance", status: readyStatus, value: "readonly" }
  ],
  environmentSummary: [
    { description: "只展示浏览器可见环境摘要，不展示密钥。", key: "environment", label: "环境", risk: warningRisk, status: readyStatus, value: "production-shell" }
  ],
  gapNote: "Settings 聚合对象为 Gap；不保存真实偏好，不展示 secret。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:26:00+08:00",
  mainSections: [
    { description: "语言、主题和显示偏好入口。", key: "preferences", status: readyStatus, title: "Preferences" },
    { description: "环境摘要、默认策略和安全提示。", key: "security-policy", status: readyStatus, title: "Security & Policy" }
  ],
  metricCards: [
    { key: "settings-readonly", label: "只读配置", risk: warningRisk, status: readyStatus, valueText: "enabled" }
  ],
  modelRoutingDisplayEntrances: [
    { intent: "navigation", key: "settings-model-routing", label: "查看模型路由", targetRoute: "model-tools" }
  ],
  pageDescription: "系统设置、环境摘要、默认策略、语言和主题偏好的静态数据。",
  pageKey: "settings",
  pageTitle: "Settings",
  permissionSummary: defaultPermissionSummary,
  preferenceEntrances: [
    { intent: "secondary", key: "settings-language", label: "Language: zh-CN" },
    { intent: "secondary", key: "settings-theme", label: "Theme: Light" }
  ],
  primaryAction: {
    disabled: true,
    intent: "disabled",
    key: "settings-save-disabled",
    label: "保存设置",
    description: "静态 UI 阶段不持久化偏好配置。"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "settings-right-assist",
    "Settings 辅助摘要",
    "承接环境摘要、默认策略、偏好入口和安全提示。"
  ),
  secondaryActions: [
    { intent: "navigation", key: "settings-open-workspace", label: "查看 Workspace", targetRoute: "workspace" }
  ],
  securityNotices: [
    { description: "浏览器端不得展示模型密钥、数据库连接串或向量库密钥。", key: "security-secret", label: "密钥保护", risk: warningRisk, status: readyStatus, value: "enabled" }
  ],
  settingsOverview: [
    { description: "Settings 只作为偏好和只读配置入口。", key: "settings-overview", label: "设置概览", status: readyStatus, value: "readonly" }
  ],
  settingsState: defaultStateCoverage.ready,
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "设置静态摘要。", key: "settings-summary", label: "偏好入口", status: readyStatus, value: "2" }
  ]
};
