import { Space } from "antd";

import type { FeedbackViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ActionBar } from "../../_shared/actions/ActionBar";
import { MetricCardGrid } from "../../_shared/metrics/MetricCardGrid";
import { SummaryCardGrid } from "../../_shared/lists/SummaryCardGrid";
import { SummaryTable } from "../../_shared/lists/SummaryTable";
import { WebSection } from "../../_shared/sections/WebSection";
import type { WebPageProps } from "../../_shared/types";

export type FeedbackSectionsProps = WebPageProps & {
  viewModel: FeedbackViewModel;
};

export function FeedbackSections({ onNavigate, viewModel }: FeedbackSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <SummaryCardGrid items={viewModel.feedbackOverview} />
        <MetricCardGrid items={viewModel.metricCards} />
        <SummaryTable
          items={[
            viewModel.selectedFeedback,
            ...viewModel.feedbackItems,
            ...viewModel.feedbackTypeFilters
          ]}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryCardGrid
          items={[
            viewModel.feedbackDetail,
            viewModel.correctionDetail,
            viewModel.targetObjectContext
          ]}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <SummaryTable items={[...viewModel.badCaseEntrances]} />
        <ActionBar actions={viewModel.secondaryActions} onNavigate={onNavigate} t={t} />
      </WebSection>
    </Space>
  );
}
