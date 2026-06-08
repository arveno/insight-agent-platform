import { Space } from "antd";

import type { WorkspaceViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ActionBar } from "../../_shared/actions/ActionBar";
import { MetricCardGrid } from "../../_shared/metrics/MetricCardGrid";
import { SummaryCardGrid } from "../../_shared/lists/SummaryCardGrid";
import { SummaryTable } from "../../_shared/lists/SummaryTable";
import { WebSection } from "../../_shared/sections/WebSection";
import type { WebPageProps } from "../../_shared/types";

export type WorkspaceSectionsProps = WebPageProps & {
  viewModel: WorkspaceViewModel;
};

export function WorkspaceSections({ onNavigate, viewModel }: WorkspaceSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <SummaryCardGrid
          items={[
            ...viewModel.workspaceOverview,
            viewModel.workspaceContext,
            viewModel.workspaceSelectorDetail
          ]}
        />
        <MetricCardGrid items={viewModel.metricCards} />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryTable
          items={[
            viewModel.selectedMember,
            ...viewModel.members,
            viewModel.selectedRole,
            ...viewModel.roles,
            viewModel.selectedBusinessDomain,
            ...viewModel.businessDomains
          ]}
        />
        <ActionBar actions={viewModel.secondaryActions} onNavigate={onNavigate} t={t} />
      </WebSection>
    </Space>
  );
}
