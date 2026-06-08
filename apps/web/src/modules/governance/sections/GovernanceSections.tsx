import { Space } from "antd";

import { ActionBar } from "../../../app/router/RouteActionBar";
import type { WebPageProps } from "../../../app/router/pageProps";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { WebSection } from "../../../shared/layout/sections/WebSection";
import { MetricCardGrid } from "../../../shared/ui/cards/MetricCardGrid";
import { SummaryCardGrid } from "../../../shared/ui/data/SummaryCardGrid";
import { SummaryTable } from "../../../shared/ui/data/SummaryTable";

import type { GovernanceViewModel } from "../models/governanceViewModel";

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
