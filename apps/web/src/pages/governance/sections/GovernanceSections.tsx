import { Space } from "antd";

import type { GovernanceViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ActionBar } from "../../_shared/actions/ActionBar";
import { MetricCardGrid } from "../../_shared/metrics/MetricCardGrid";
import { SummaryCardGrid } from "../../_shared/lists/SummaryCardGrid";
import { SummaryTable } from "../../_shared/lists/SummaryTable";
import { WebSection } from "../../_shared/sections/WebSection";
import type { WebPageProps } from "../../_shared/types";

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
