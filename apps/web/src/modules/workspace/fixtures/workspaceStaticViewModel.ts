import { createRightAssistSummary, defaultPermissionSummary, defaultReadonlyState, defaultStateCoverage, readyStatus, warningRisk } from "../../../shared/view-model/staticStateFixtures";
import type { WorkspaceViewModel } from "../models/workspaceViewModel";

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
    {
      descriptionKey: "page.workspace.section.workspaceOverview.description",
      key: "workspace-overview",
      status: readyStatus,
      titleKey: "page.workspace.section.workspaceOverview.title"
    },
    {
      descriptionKey: "page.workspace.section.membersRolesDomains.description",
      key: "members-roles-domains",
      status: readyStatus,
      titleKey: "page.workspace.section.membersRolesDomains.title"
    }
  ],
  members: [member],
  metricCards: [
    {
      key: "workspace-member-count",
      label: "成员数",
      risk: warningRisk,
      status: readyStatus,
      valueText: "18"
    }
  ],
  pageDescriptionKey: "page.workspace.description",
  pageKey: "workspace",
  pageTitleKey: "page.workspace.title",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "workspace-open-settings",
    labelKey: "action.workspaceOpenSettings.label",
    targetRoute: "settings"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "workspace-right-assist",
    "page.workspace.rightAssist.title",
    "page.workspace.rightAssist.description"
  ),
  roles: [role],
  secondaryActions: [
    {
      intent: "navigation",
      key: "workspace-open-governance",
      labelKey: "action.workspaceOpenGovernance.label",
      targetRoute: "governance"
    }
  ],
  selectedBusinessDomain: businessDomain,
  selectedMember: member,
  selectedRole: role,
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "Workspace 静态摘要。",
      key: "workspace-summary",
      label: "业务域",
      status: readyStatus,
      value: "6"
    }
  ],
  workspaceContext: {
    description: "Header workspace selector 的全局上下文输入。",
    key: "workspace-context",
    label: "North Star Workspace",
    status: readyStatus,
    value: "workspace-north-star"
  },
  workspaceOverview: [
    {
      description: "Workspace 详情、成员、角色和业务域主承接页。",
      key: "workspace-overview-card",
      label: "Workspace",
      status: readyStatus,
      value: "North Star"
    }
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
