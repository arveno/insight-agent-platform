import { Space } from "antd";

import type { MemoryViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ActionBar } from "../../_shared/actions/ActionBar";
import { MetricCardGrid } from "../../_shared/metrics/MetricCardGrid";
import { SummaryCardGrid } from "../../_shared/lists/SummaryCardGrid";
import { SummaryTable } from "../../_shared/lists/SummaryTable";
import { WebSection } from "../../_shared/sections/WebSection";
import type { WebPageProps } from "../../_shared/types";

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
