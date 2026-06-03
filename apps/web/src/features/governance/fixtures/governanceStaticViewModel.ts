import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningRisk
} from "../../../app/fixtures";
import type { GovernanceViewModel } from "../models";

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
    { description: "治理概览只展示静态摘要。", key: "governance-overview", label: "治理状态", risk: warningRisk, status: readyStatus, value: "3 policies" }
  ],
  governancePolicyDetail: permissionPolicy,
  governanceState: defaultStateCoverage.ready,
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:16:00+08:00",
  mainSections: [
    { description: "权限策略、Tool Permission 和 SQL Guard 摘要。", key: "policy", status: readyStatus, title: "Policy & Permission" },
    { description: "审计日志和风险控制摘要。", key: "audit-risk", status: readyStatus, title: "Audit & Risk" }
  ],
  metricCards: [
    { key: "risk-controls", label: "风险控制", risk: warningRisk, status: readyStatus, valueText: "3 active" }
  ],
  pageDescription: "权限策略、SQL Guard、Tool Permission、审计和风险控制的静态数据。",
  pageKey: "governance",
  pageTitle: "Governance",
  permissionPolicies: [permissionPolicy],
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    disabled: true,
    intent: "disabled",
    key: "governance-policy-edit-disabled",
    label: "编辑策略",
    description: "静态 UI 阶段不执行权限变更。"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "governance-right-assist",
    "Governance 辅助摘要",
    "承接 selected policy、audit、risk control 和 permission summary。"
  ),
  riskControls: [riskControl],
  secondaryActions: [
    { intent: "navigation", key: "governance-open-model-tools", label: "查看 Tool 定义", targetRoute: "model-tools" }
  ],
  selectedAuditLog: auditLog,
  selectedPermissionPolicy: permissionPolicy,
  selectedRiskControl: riskControl,
  selectedToolPermission: permissionPolicy,
  sqlGuardSummary: [riskControl],
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "治理 Surface 静态摘要。", key: "governance-card", label: "策略数", status: readyStatus, value: "3" }
  ],
  toolPermissions: [permissionPolicy]
};
