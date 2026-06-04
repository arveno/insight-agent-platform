import { Space } from "antd";

import type { MemoryViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared";
import {
  ActionBar,
  MetricCardGrid,
  SummaryCardGrid,
  SummaryTable,
  WebSection,
  type WebPageProps
} from "../../_shared";

export type MemorySectionsProps = WebPageProps & {
  viewModel: MemoryViewModel;
};

export function MemorySections({ onNavigate, viewModel }: MemorySectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <SummaryCardGrid items={viewModel.memoryOverview} />
        <MetricCardGrid items={viewModel.metricCards} />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryTable
          items={[
            viewModel.selectedMemoryItem,
            ...viewModel.memoryItems,
            ...viewModel.memoryTypeFilters
          ]}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <SummaryCardGrid
          items={[
            viewModel.relatedObjectDetail,
            ...viewModel.memoryUsageTrace,
            ...viewModel.analysisRunDecisionLinks
          ]}
        />
        <ActionBar actions={viewModel.secondaryActions} onNavigate={onNavigate} t={t} />
      </WebSection>
    </Space>
  );
}
