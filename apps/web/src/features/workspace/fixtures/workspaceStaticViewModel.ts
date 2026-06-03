import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningRisk
} from "../../../app/fixtures";
import type { WorkspaceViewModel } from "../models";

const member = {
  description: "成员摘要，真实用户管理不在 #67。",
  key: "member-ada",
  label: "Ada Chen",
  status: readyStatus,
  value: "Owner"
};

const role = {
  description: "角色摘要，权限决策归 Governance。",
  key: "role-analyst",
  label: "Analyst",
  risk: warningRisk,
  status: readyStatus,
  value: "readonly"
};

const businessDomain = {
  description: "业务域摘要，可作为 Analysis 上下文。",
  key: "domain-revenue",
  label: "Revenue",
  status: readyStatus,
  value: "active"
};

export const workspaceStaticViewModel: WorkspaceViewModel = {
  businessDomains: [businessDomain],
  gapNote: "workspace_members 聚合为 Gap；不实现真实成员、角色或业务域管理。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:28:00+08:00",
  mainSections: [
    { description: "Workspace 总览和 Header selector 详情。", key: "workspace-overview", status: readyStatus, title: "Workspace Overview" },
    { description: "成员、角色和业务域静态摘要。", key: "members-roles-domains", status: readyStatus, title: "Members / Roles / Domains" }
  ],
  members: [member],
  metricCards: [
    { key: "workspace-member-count", label: "成员数", risk: warningRisk, status: readyStatus, valueText: "18" }
  ],
  pageDescription: "Workspace 总览、成员、角色、业务域和 Header workspace selector 的静态数据。",
  pageKey: "workspace",
  pageTitle: "Workspace",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "workspace-open-settings",
    label: "打开设置",
    targetRoute: "settings"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "workspace-right-assist",
    "Workspace 辅助摘要",
    "承接 workspace、member、role、business domain 和 selector 摘要。"
  ),
  roles: [role],
  secondaryActions: [
    { intent: "navigation", key: "workspace-open-governance", label: "查看治理", targetRoute: "governance" }
  ],
  selectedBusinessDomain: businessDomain,
  selectedMember: member,
  selectedRole: role,
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "Workspace 静态摘要。", key: "workspace-summary", label: "业务域", status: readyStatus, value: "6" }
  ],
  workspaceContext: {
    description: "Header workspace selector 的全局上下文输入。",
    key: "workspace-context",
    label: "North Star Workspace",
    status: readyStatus,
    value: "workspace-north-star"
  },
  workspaceOverview: [
    { description: "Workspace 详情、成员、角色和业务域主承接页。", key: "workspace-overview-card", label: "Workspace", status: readyStatus, value: "North Star" }
  ],
  workspaceSelectorDetail: {
    description: "Selector detail 只作为静态展示输入。",
    key: "workspace-selector",
    label: "Workspace selector",
    status: readyStatus,
    value: "North Star Workspace"
  },
  workspaceState: defaultStateCoverage.ready
};
