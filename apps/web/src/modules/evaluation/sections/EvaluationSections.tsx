import { Space } from "antd";

import { ActionBar } from "../../../app/router/RouteActionBar";
import type { WebPageProps } from "../../../app/router/pageProps";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { WebSection } from "../../../shared/layout/sections/WebSection";
import { MetricCardGrid } from "../../../shared/ui/cards/MetricCardGrid";
import { SummaryCardGrid } from "../../../shared/ui/data/SummaryCardGrid";
import { SummaryTable } from "../../../shared/ui/data/SummaryTable";

import type { EvaluationViewModel } from "../models/evaluationViewModel";

export type EvaluationSectionsProps = WebPageProps & {
  viewModel: EvaluationViewModel;
};

export function EvaluationSections({ onNavigate, viewModel }: EvaluationSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <SummaryCardGrid items={viewModel.evaluationOverview} />
        <SummaryTable
          items={[
            viewModel.selectedDataset,
            ...viewModel.evaluationDatasets,
            ...viewModel.datasetItems
          ]}
        />
        <SummaryTable items={[viewModel.selectedEvaluationRun, ...viewModel.evaluationRuns]} />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <MetricCardGrid items={viewModel.metricCards} />
        <SummaryCardGrid
          items={[viewModel.selectedRubric, ...viewModel.rubrics, ...viewModel.scoreSummary]}
        />
        <SummaryTable
          items={[
            viewModel.selectedBadCase,
            ...viewModel.badCases,
            ...viewModel.modelReportFeedbackReferences
          ]}
        />
        <ActionBar actions={viewModel.secondaryActions} onNavigate={onNavigate} t={t} />
      </WebSection>
    </Space>
  );
}
