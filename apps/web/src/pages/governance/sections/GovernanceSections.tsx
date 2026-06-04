import { Space } from "antd";

import type { GovernanceViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared";
import {
  ActionBar,
  MetricCardGrid,
  SummaryCardGrid,
  SummaryTable,
  WebSection,
  type WebPageProps
} from "../../_shared";

export type GovernanceSectionsProps = WebPageProps & {
  viewModel: GovernanceViewModel;
};

export function GovernanceSections({ onNavigate, viewModel }: GovernanceSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <SummaryCardGrid
          items={[...viewModel.governanceOverview, viewModel.governancePolicyDetail]}
        />
        <SummaryTable
          items={[
            viewModel.selectedPermissionPolicy,
            ...viewModel.permissionPolicies,
            viewModel.selectedToolPermission,
            ...viewModel.toolPermissions
          ]}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <MetricCardGrid items={viewModel.metricCards} />
        <SummaryTable
          items={[
            ...viewModel.sqlGuardSummary,
            viewModel.selectedAuditLog,
            ...viewModel.auditLogs,
            viewModel.selectedRiskControl,
            ...viewModel.riskControls
          ]}
        />
        <ActionBar actions={viewModel.secondaryActions} onNavigate={onNavigate} t={t} />
      </WebSection>
    </Space>
  );
}
