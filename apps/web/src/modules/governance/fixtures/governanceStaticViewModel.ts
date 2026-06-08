import { createRightAssistSummary, defaultPermissionSummary, defaultReadonlyState, defaultStateCoverage, readyStatus, warningRisk } from "../../../app/shell/fixtures/staticStateFixtures";
import type { GovernanceViewModel } from "../models/governanceViewModel";

const permissionPolicy = {
  description: "PermissionPolicy 摘要，只展示权限可见性。",
  key: "policy-analyst-readonly",
  label: "Analyst readonly policy",
  risk: warningRisk,
  status: readyStatus,
  value: "readonly"
};

const auditLog = {
  description: "审计日志摘要，不展示 raw request。",
  key: "audit-log-policy-check",
  label: "Tool permission checked",
  status: readyStatus,
  value: "allowed"
};

const riskControl = {
  description: "风险规则摘要，规则执行不在静态 UI 阶段实现。",
  key: "risk-rule-sql-guard",
  label: "SQL Guard",
  risk: warningRisk,
  status: readyStatus,
  value: "enabled"
};

export const governanceStaticViewModel: GovernanceViewModel = {
  auditLogs: [auditLog],
  gapNote: "Tool permission summary 和 governance aggregate 为 Gap；不执行权限决策。",
  governanceOverview: [
    {
      description: "治理概览只展示静态摘要。",
      key: "governance-overview",
      label: "治理状态",
      risk: warningRisk,
      status: readyStatus,
      value: "3 policies"
    }
  ],
  governancePolicyDetail: permissionPolicy,
  governanceState: defaultStateCoverage.ready,
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:16:00+08:00",
  mainSections: [
    {
      descriptionKey: "page.governance.section.policy.description",
      key: "policy",
      status: readyStatus,
      titleKey: "page.governance.section.policy.title"
    },
    {
      descriptionKey: "page.governance.section.auditRisk.description",
      key: "audit-risk",
      status: readyStatus,
      titleKey: "page.governance.section.auditRisk.title"
    }
  ],
  metricCards: [
    {
      key: "risk-controls",
      label: "风险控制",
      risk: warningRisk,
      status: readyStatus,
      valueText: "3 active"
    }
  ],
  pageDescriptionKey: "page.governance.description",
  pageKey: "governance",
  pageTitleKey: "page.governance.title",
  permissionPolicies: [permissionPolicy],
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    disabled: true,
    intent: "disabled",
    key: "governance-policy-edit-disabled",
    labelKey: "action.governancePolicyEditDisabled.label",
    descriptionKey: "action.governancePolicyEditDisabled.description"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "governance-right-assist",
    "page.governance.rightAssist.title",
    "page.governance.rightAssist.description"
  ),
  riskControls: [riskControl],
  secondaryActions: [
    {
      intent: "navigation",
      key: "governance-open-model-tools",
      labelKey: "action.governanceOpenModelTools.label",
      targetRoute: "model-tools"
    }
  ],
  selectedAuditLog: auditLog,
  selectedPermissionPolicy: permissionPolicy,
  selectedRiskControl: riskControl,
  selectedToolPermission: permissionPolicy,
  sqlGuardSummary: [riskControl],
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "治理 Surface 静态摘要。",
      key: "governance-card",
      label: "策略数",
      status: readyStatus,
      value: "3"
    }
  ],
  toolPermissions: [permissionPolicy]
};
