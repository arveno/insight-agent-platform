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
    { count: 1, key: "jobs", labelKey: "page.platformOperations.tab.jobs.label", status: "ready" },
    {
      count: 1,
      key: "quality",
      labelKey: "page.platformOperations.tab.quality.label",
      status: "warning"
    }
  ],
  lastUpdatedAt: "2026-06-03T18:24:00+08:00",
  mainSections: [
    {
      descriptionKey: "page.platformOperations.section.jobsQuality.description",
      key: "jobs-quality",
      status: readyStatus,
      titleKey: "page.platformOperations.section.jobsQuality.title"
    },
    {
      descriptionKey: "page.platformOperations.section.opsStatus.description",
      key: "ops-status",
      status: readyStatus,
      titleKey: "page.platformOperations.section.opsStatus.title"
    }
  ],
  metricCards: [
    {
      key: "job-health",
      label: "Job 健康",
      risk: warningRisk,
      status: readyStatus,
      valueText: "1 warning"
    }
  ],
  migrationStatus: {
    description: "MigrationResult 待确认 / Gap。",
    key: "migration-status",
    label: "Migration",
    status: warningStatus,
    value: "待确认 / Gap"
  },
  notifications: [notification],
  pageDescriptionKey: "page.platformOperations.description",
  pageKey: "platform-operations",
  pageTitleKey: "page.platformOperations.title",
  permissionSummary: defaultPermissionSummary,
  platformOperationsOverview: [
    {
      description: "平台运维状态只读摘要。",
      key: "platform-overview",
      label: "运维状态",
      risk: warningRisk,
      status: readyStatus,
      value: "attention"
    }
  ],
  platformOperationsState: defaultStateCoverage.ready,
  primaryAction: {
    disabled: true,
    intent: "disabled",
    key: "platform-run-job-disabled",
    labelKey: "action.platformRunJobDisabled.label",
    descriptionKey: "action.platformRunJobDisabled.description"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "platform-operations-right-assist",
    "page.platformOperations.rightAssist.title",
    "page.platformOperations.rightAssist.description"
  ),
  secondaryActions: [
    {
      intent: "navigation",
      key: "platform-open-dashboard",
      labelKey: "action.platformOpenDashboard.label",
      targetRoute: "dashboard"
    }
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
    {
      description: "运维静态摘要。",
      key: "platform-summary",
      label: "任务",
      risk: warningRisk,
      status: readyStatus,
      value: "6"
    }
  ]
};
