import { Space } from "antd";

import type { PlatformOperationsViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared";
import {
  ActionBar,
  MetricCardGrid,
  SummaryCardGrid,
  SummaryTable,
  TabsPanel,
  WebSection,
  type WebPageProps
} from "../../_shared";

export type PlatformOperationsSectionsProps = WebPageProps & {
  viewModel: PlatformOperationsViewModel;
};

export function PlatformOperationsSections({
  onNavigate,
  viewModel
}: PlatformOperationsSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <TabsPanel
          tabs={viewModel.jobTabs}
          childrenByKey={{
            jobs: <SummaryTable items={[viewModel.selectedJob, ...viewModel.jobs]} />,
            quality: (
              <SummaryTable
                items={[viewModel.selectedDataQualityCheck, ...viewModel.dataQualityChecks]}
              />
            )
          }}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryCardGrid
          items={[
            ...viewModel.platformOperationsOverview,
            viewModel.deploymentStatus,
            viewModel.migrationStatus,
            viewModel.smokeTestStatus,
            viewModel.detailDrawer,
            viewModel.selectedNotification,
            ...viewModel.notifications
          ]}
        />
        <MetricCardGrid items={viewModel.metricCards} />
        <ActionBar actions={viewModel.secondaryActions} onNavigate={onNavigate} t={t} />
      </WebSection>
    </Space>
  );
}
