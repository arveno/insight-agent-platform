import { createRightAssistSummary, defaultPermissionSummary, defaultReadonlyState, defaultStateCoverage, readyStatus, warningRisk, warningStatus } from "../../../shared/view-model/staticStateFixtures";
import type { PlatformOperationDetailViewModel, PlatformOperationListItemViewModel, PlatformOperationsViewModel, PlatformOperationsWorkspaceBinding } from "../models/platformOperationsViewModel";

const lowRisk = {
  level: "low",
  titleKey: "risk.low.title"
} as const;

export const defaultPlatformOperationsWorkspaceBinding: PlatformOperationsWorkspaceBinding = {
  workspaceId: "workspace-northstar-retail-china",
  workspaceName: "Northstar Retail China"
};

type OperationBlueprint = Omit<PlatformOperationDetailViewModel, "workspaceId">;

const operationBlueprints: OperationBlueprint[] = [
  {
    category: "job",
    description:
      "夜间数据质量 Job 只作为当前 Workspace 的只读运行摘要，不触发真实任务执行或重跑。",
    impactText:
      "1 个下游数据质量检查处于关注态，需要结合平台状态和通知判断是否影响 Dashboard 可信度。",
    key: "nightly-data-quality",
    lastRunText: "最近一次：今天 02:10",
    ownerText: "Owner：Data Platform",
    relatedObjects: [
      {
        key: "nightly-data-quality-workspace",
        label: "workspaceId",
        value: "workspace-northstar-retail-china"
      },
      {
        key: "nightly-data-quality-related-check",
        label: "relatedCheck",
        value: "Revenue completeness"
      },
      {
        key: "nightly-data-quality-related-status",
        label: "linkedStatus",
        value: "Smoke pending review"
      }
    ],
    risk: warningRisk,
    status: warningStatus,
    summary: "夜间质量链路完成调度，但有 1 个下游质量检查进入关注态。",
    title: "nightly-data-quality"
  },
  {
    category: "data_quality",
    description:
      "数据质量检查摘要只解释当前 Workspace 的可信度风险来源，不执行真实检查或真实查询。",
    impactText: "如果该检查异常，Dashboard 的收入类指标和相关分析结论需要谨慎解读。",
    key: "revenue-completeness",
    lastRunText: "最近一次：今天 02:18",
    ownerText: "Owner：Revenue Analytics",
    relatedObjects: [
      {
        key: "revenue-completeness-workspace",
        label: "workspaceId",
        value: "workspace-northstar-retail-china"
      },
      {
        key: "revenue-completeness-source",
        label: "sourceField",
        value: "sales_order.recognized_revenue"
      },
      {
        key: "revenue-completeness-job",
        label: "upstreamJob",
        value: "nightly-data-quality"
      }
    ],
    risk: warningRisk,
    status: readyStatus,
    summary: "Revenue completeness 在静态摘要中保持可读，但存在需要复核的缺口波动。",
    title: "Revenue completeness"
  },
  {
    category: "notification",
    description:
      "通知 / 告警只作为当前 Workspace 的只读摘要，不触发真实告警发送或升级。",
    impactText: "用于提醒当前异常更可能来自数据质量或链路状态，而不是经营指标本身。",
    key: "quality-notification",
    lastRunText: "最近通知：今天 02:22",
    ownerText: "Owner：Platform Watch",
    relatedObjects: [
      {
        key: "quality-notification-workspace",
        label: "workspaceId",
        value: "workspace-northstar-retail-china"
      },
      {
        key: "quality-notification-target",
        label: "relatedObject",
        value: "Revenue completeness"
      }
    ],
    risk: lowRisk,
    status: readyStatus,
    summary: "质量检查通知提示收入相关数据链路需要人工复核。",
    title: "质量检查通知"
  },
  {
    category: "deployment",
    description: "Deployment 状态只读展示，用于判断当前 Workspace 的平台支撑是否稳定。",
    impactText: "当前版本未暴露部署控制台，状态只用于解释页面可信度和后续排查入口。",
    key: "deployment",
    lastRunText: "最近更新：今天 01:40",
    ownerText: "Owner：Release Operations",
    relatedObjects: [
      {
        key: "deployment-workspace",
        label: "workspaceId",
        value: "workspace-northstar-retail-china"
      },
      {
        key: "deployment-channel",
        label: "channel",
        value: "workspace-app-web"
      }
    ],
    status: readyStatus,
    summary: "Deployment 状态正常，可作为当前 Workspace 平台支撑的只读参考。",
    title: "Deployment"
  },
  {
    category: "smoke",
    description: "Smoke 状态只读展示，用于判断最近一次平台变更后关键链路是否需要复核。",
    impactText:
      "Smoke 关注态意味着 Dashboard 与 Analysis 结果可能需要结合 Job / 数据质量状态一起判断。",
    key: "smoke",
    lastRunText: "最近更新：今天 01:55",
    ownerText: "Owner：Release Operations",
    relatedObjects: [
      {
        key: "smoke-workspace",
        label: "workspaceId",
        value: "workspace-northstar-retail-china"
      },
      {
        key: "smoke-target",
        label: "relatedObject",
        value: "dashboard-revenue-overview"
      }
    ],
    risk: warningRisk,
    status: warningStatus,
    summary: "Smoke 状态待复核，提示平台链路可能影响当前 Workspace 的看板可信度。",
    title: "Smoke"
  },
  {
    category: "migration",
    description: "Migration 状态只读展示，用于解释近期结构变更是否可能影响当前 Workspace 的数据链路。",
    impactText: "Migration 关注态需要优先作为平台原因排查入口，而不是直接判定为业务异常。",
    key: "migration",
    lastRunText: "最近更新：昨天 23:48",
    ownerText: "Owner：Data Infra",
    relatedObjects: [
      {
        key: "migration-workspace",
        label: "workspaceId",
        value: "workspace-northstar-retail-china"
      },
      {
        key: "migration-target",
        label: "relatedObject",
        value: "revenue_snapshot_daily"
      }
    ],
    risk: warningRisk,
    status: warningStatus,
    summary: "Migration 状态待确认，可能影响收入快照链路和下游只读摘要。",
    title: "Migration"
  }
];

const defaultSelectedOperationKey = operationBlueprints[0].key;

function toOperationListItem(
  detail: PlatformOperationDetailViewModel
): PlatformOperationListItemViewModel {
  return {
    category: detail.category,
    key: detail.key,
    risk: detail.risk,
    status: detail.status,
    title: detail.title
  };
}

function resolveSelectedBlueprint(operationKey: string): OperationBlueprint {
  return (
    operationBlueprints.find((operation) => operation.key === operationKey) ??
    operationBlueprints[0]
  );
}

function toWorkspaceDetail(
  blueprint: OperationBlueprint,
  workspaceBinding: PlatformOperationsWorkspaceBinding
): PlatformOperationDetailViewModel {
  return {
    ...blueprint,
    relatedObjects: blueprint.relatedObjects?.map((object) =>
      object.label === "workspaceId"
        ? { ...object, value: workspaceBinding.workspaceId }
        : object
    ),
    workspaceId: workspaceBinding.workspaceId
  };
}

export function createPlatformOperationsViewModel(
  selectedOperationKey = defaultSelectedOperationKey,
  workspaceBinding: PlatformOperationsWorkspaceBinding = defaultPlatformOperationsWorkspaceBinding
): PlatformOperationsViewModel {
  const operationItems = operationBlueprints.map((operation) =>
    toOperationListItem(toWorkspaceDetail(operation, workspaceBinding))
  );
  const selectedOperation = toWorkspaceDetail(
    resolveSelectedBlueprint(selectedOperationKey),
    workspaceBinding
  );

  return {
    implementationStatus: "stable",
    lastUpdatedAt: "2026-06-06T10:24:00+08:00",
    mainSections: [
      {
        descriptionKey: "page.platformOperations.section.overview.description",
        key: "platform-operations-overview",
        status: readyStatus,
        titleKey: "page.platformOperations.section.overview.title"
      },
      {
        descriptionKey: "page.platformOperations.section.jobsDataQuality.description",
        key: "platform-operations-jobs-data-quality",
        status: readyStatus,
        titleKey: "page.platformOperations.section.jobsDataQuality.title"
      },
      {
        descriptionKey: "page.platformOperations.section.platformStatus.description",
        key: "platform-operations-status",
        status: readyStatus,
        titleKey: "page.platformOperations.section.platformStatus.title"
      },
      {
        descriptionKey: "page.platformOperations.section.riskNavigation.description",
        key: "platform-operations-risk-navigation",
        status: readyStatus,
        titleKey: "page.platformOperations.section.riskNavigation.title"
      }
    ],
    metricCards: [],
    pageDescriptionKey: "page.platformOperations.description",
    pageKey: "platform-operations",
    pageTitleKey: "page.platformOperations.title",
    permissionSummary: defaultPermissionSummary,
    platformOperationsState: defaultStateCoverage.ready,
    primaryAction: {
      intent: "navigation",
      key: "platform-hidden-primary-action",
      labelKey: "action.platformOpenDashboard.label",
      targetRoute: "dashboard"
    },
    readonlyNotice:
      "不执行真实 Job，不执行真实数据质量检查，不执行部署、migration 或 smoke。",
    readonlyState: defaultReadonlyState,
    rightAssistSummary: createRightAssistSummary(
      "platform-operations-right-assist",
      "page.platformOperations.rightAssist.title",
      "page.platformOperations.rightAssist.description"
    ),
    secondaryActions: [],
    selectedOperation,
    stateCoverage: defaultStateCoverage,
    summaryCards: [
      {
        description: "当前 Workspace 的 Job 健康只读摘要。",
        key: "platform-operations-summary-job-health",
        label: "Job 健康",
        risk: warningRisk,
        status: warningStatus,
        value: "1 warning"
      },
      {
        description: "当前 Workspace 的数据质量可信度只读摘要。",
        key: "platform-operations-summary-data-quality",
        label: "数据质量状态",
        risk: warningRisk,
        status: readyStatus,
        value: "1 attention"
      },
      {
        description: "当前 Workspace 的通知 / 告警只读摘要。",
        key: "platform-operations-summary-notifications",
        label: "通知 / 告警",
        risk: lowRisk,
        status: readyStatus,
        value: "1 unread"
      },
      {
        description: "Deployment / Smoke / Migration 的只读平台状态摘要。",
        key: "platform-operations-summary-platform-state",
        label: "平台状态",
        risk: warningRisk,
        status: readyStatus,
        value: "Deployment ready / Smoke warning / Migration warning"
      }
    ],
    workspaceBinding,
    workspaceNotice:
      "当前展示的是当前 Workspace 的平台与数据链路健康状态。切换 Workspace 后，Job、DataQualityCheck、Notification、Deployment / Smoke / Migration 摘要都应重新归属当前 Workspace。",
    operationItems
  };
}

export const platformOperationsStaticViewModel = createPlatformOperationsViewModel();
