import { Space } from "antd";

import type { WebPageProps } from "../../../app/router/pageProps";
import { StaticChart } from "../../../shared/charts/StaticChart";
import { WebSection } from "../../../shared/layout/sections/WebSection";
import { MetricCardGrid } from "../../../shared/ui/cards/MetricCardGrid";
import { SummaryCardGrid } from "../../../shared/ui/data/SummaryCardGrid";
import { SummaryTable } from "../../../shared/ui/data/SummaryTable";

import { TracePanel } from "../TracePanel";
import type { ObservabilityViewModel } from "../models/observabilityViewModel";

export type ObservabilitySectionsProps = WebPageProps & {
  viewModel: ObservabilityViewModel;
};

export function ObservabilitySections({ viewModel }: ObservabilitySectionsProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <SummaryCardGrid items={viewModel.observabilityOverview} />
        <TracePanel
          items={[
            ...viewModel.runTraces,
            ...viewModel.modelTraces,
            ...viewModel.toolTraces,
            ...viewModel.runtimeEvents
          ]}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <MetricCardGrid items={viewModel.metricCards} />
        <SummaryCardGrid items={[...viewModel.costLatencySummary, ...viewModel.errorRateSummary]} />
        <StaticChart titleKey={viewModel.mainSections[1].titleKey} />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <SummaryTable items={[viewModel.traceDetail]} />
        <TracePanel
          items={[
            viewModel.selectedRunTrace,
            viewModel.selectedModelTrace,
            viewModel.selectedToolTrace,
            viewModel.selectedRuntimeEvent
          ]}
        />
      </WebSection>
    </Space>
  );
}
