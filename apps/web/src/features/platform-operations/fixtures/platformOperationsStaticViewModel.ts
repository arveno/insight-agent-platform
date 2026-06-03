import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningStatus,
  warningRisk
} from "../../../app/fixtures";
import type { PlatformOperationsViewModel } from "../models";

const job = {
  description: "Job 状态只作为只读运维摘要，不执行 Job。",
  key: "job-data-quality-nightly",
  label: "nightly-data-quality",
  risk: warningRisk,
  status: readyStatus,
  value: "warning"
};

const notification = {
  description: "通知摘要静态展示。",
  key: "notification-quality",
  label: "质量检查通知",
  status: readyStatus,
  value: "unread"
};

const dataQualityCheck = {
  description: "数据质量检查摘要，真实执行不在 #67。",
  key: "dq-check-revenue",
  label: "Revenue completeness",
  risk: warningRisk,
  status: readyStatus,
  value: "attention"
};

export const platformOperationsStaticViewModel: PlatformOperationsViewModel = {
  dataQualityChecks: [dataQualityCheck],
  deploymentStatus: {
    description: "Deployment / smoke / migration 为只读状态摘要。",
    key: "deployment-status",
    label: "Deployment",
    status: readyStatus,
    value: "green"
  },
  detailDrawer: {
    description: "详情 Drawer 输入，不创建组件本体。",
    key: "platform-detail-drawer",
    label: "Detail Drawer",
    status: readyStatus,
    value: "selected job"
  },
  gapNote: "Deployment / SmokeTest / MigrationResult、IngestionJob / index job 为 Gap。",
  implementationStatus: "gap",
  jobs: [job],
  jobTabs: [
    { count: 1, key: "jobs", label: "Jobs", status: "ready" },
    { count: 1, key: "quality", label: "Data Quality", status: "warning" }
  ],
  lastUpdatedAt: "2026-06-03T18:24:00+08:00",
  mainSections: [
    { description: "Job Tabs、Notification 和 DataQualityCheck 摘要。", key: "jobs-quality", status: readyStatus, title: "Jobs & Quality" },
    { description: "Deployment、smoke、migration 只读状态。", key: "ops-status", status: readyStatus, title: "Operations Status" }
  ],
  metricCards: [
    { key: "job-health", label: "Job 健康", risk: warningRisk, status: readyStatus, valueText: "1 warning" }
  ],
  migrationStatus: {
    description: "MigrationResult 待确认 / Gap。",
    key: "migration-status",
    label: "Migration",
    status: warningStatus,
    value: "待确认 / Gap"
  },
  notifications: [notification],
  pageDescription: "Job、通知、数据质量、部署、smoke 和 migration 只读状态的静态数据。",
  pageKey: "platform-operations",
  pageTitle: "Platform Operations",
  permissionSummary: defaultPermissionSummary,
  platformOperationsOverview: [
    { description: "平台运维状态只读摘要。", key: "platform-overview", label: "运维状态", risk: warningRisk, status: readyStatus, value: "attention" }
  ],
  platformOperationsState: defaultStateCoverage.ready,
  primaryAction: {
    disabled: true,
    intent: "disabled",
    key: "platform-run-job-disabled",
    label: "执行 Job",
    description: "静态 UI 阶段不执行 Job。"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "platform-operations-right-assist",
    "Platform Operations 辅助摘要",
    "承接 selected job、notification、data quality、deployment、smoke 和 migration 摘要。"
  ),
  secondaryActions: [
    { intent: "navigation", key: "platform-open-dashboard", label: "回到 Dashboard", targetRoute: "dashboard" }
  ],
  selectedDataQualityCheck: dataQualityCheck,
  selectedJob: job,
  selectedNotification: notification,
  smokeTestStatus: {
    description: "SmokeTest 待确认 / Gap。",
    key: "smoke-status",
    label: "Smoke",
    status: warningStatus,
    value: "待确认 / Gap"
  },
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "运维静态摘要。", key: "platform-summary", label: "任务", risk: warningRisk, status: readyStatus, value: "6" }
  ]
};
