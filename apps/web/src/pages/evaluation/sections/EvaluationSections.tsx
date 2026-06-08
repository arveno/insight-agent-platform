import { Space } from "antd";

import type { EvaluationViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ActionBar } from "../../_shared/actions/ActionBar";
import { MetricCardGrid } from "../../_shared/metrics/MetricCardGrid";
import { SummaryCardGrid } from "../../_shared/lists/SummaryCardGrid";
import { SummaryTable } from "../../_shared/lists/SummaryTable";
import { WebSection } from "../../_shared/sections/WebSection";
import type { WebPageProps } from "../../_shared/types";

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
