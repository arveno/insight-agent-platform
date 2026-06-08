import { Space } from "antd";

import { ActionBar } from "../../../app/router/RouteActionBar";
import type { WebPageProps } from "../../../app/router/pageProps";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { WebSection } from "../../../shared/layout/sections/WebSection";
import { MetricCardGrid } from "../../../shared/ui/cards/MetricCardGrid";
import { SummaryCardGrid } from "../../../shared/ui/data/SummaryCardGrid";
import { SummaryTable } from "../../../shared/ui/data/SummaryTable";

import type { FeedbackViewModel } from "../models/feedbackViewModel";

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
