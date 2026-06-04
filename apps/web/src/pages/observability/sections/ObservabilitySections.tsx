import { Space } from "antd";

import type { ObservabilityViewModel } from "../../../features/static-view-models";
import {
  MetricCardGrid,
  StaticChart,
  SummaryCardGrid,
  SummaryTable,
  TracePanel,
  WebSection,
  type WebPageProps
} from "../../_shared";

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
