import { Space } from "antd";

import { ActionBar } from "../../../app/router/RouteActionBar";
import type { WebPageProps } from "../../../app/router/pageProps";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { WebSection } from "../../../shared/layout/sections/WebSection";
import { MetricCardGrid } from "../../../shared/ui/cards/MetricCardGrid";
import { SummaryCardGrid } from "../../../shared/ui/data/SummaryCardGrid";
import { SummaryTable } from "../../../shared/ui/data/SummaryTable";

import type { MemoryViewModel } from "../models/memoryViewModel";

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
