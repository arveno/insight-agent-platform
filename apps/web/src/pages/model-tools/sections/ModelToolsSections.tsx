import { Space } from "antd";

import type { ModelToolsViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ActionBar } from "../../_shared/actions/ActionBar";
import { MetricCardGrid } from "../../_shared/metrics/MetricCardGrid";
import { SummaryCardGrid } from "../../_shared/lists/SummaryCardGrid";
import { SummaryTable } from "../../_shared/lists/SummaryTable";
import { TabsPanel } from "../../_shared/tabs/TabsPanel";
import { WebSection } from "../../_shared/sections/WebSection";
import type { WebPageProps } from "../../_shared/types";

export type ModelToolsSectionsProps = WebPageProps & {
  viewModel: ModelToolsViewModel;
};

export function ModelToolsSections({ onNavigate, viewModel }: ModelToolsSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <TabsPanel
          tabs={viewModel.modelToolsTabs}
          childrenByKey={{
            modelConfigs: (
              <SummaryTable items={[viewModel.selectedModelConfig, ...viewModel.modelConfigs]} />
            ),
            routingPolicies: (
              <SummaryTable
                items={[viewModel.selectedRoutingPolicy, ...viewModel.routingPolicies]}
              />
            ),
            promptVersions: (
              <SummaryTable
                items={[viewModel.selectedPromptVersion, ...viewModel.promptVersions]}
              />
            ),
            toolDefinitions: (
              <SummaryTable
                items={[viewModel.selectedToolDefinition, ...viewModel.toolDefinitions]}
              />
            ),
            ragStrategies: (
              <SummaryTable items={[viewModel.selectedRagStrategy, ...viewModel.ragStrategies]} />
            )
          }}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryCardGrid items={[viewModel.configDetail, ...viewModel.permissionSummaryEntries]} />
        <MetricCardGrid items={viewModel.metricCards} />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <ActionBar
          actions={[
            ...viewModel.permissionEntrances,
            ...viewModel.relatedDataKnowledgeEntrances,
            ...viewModel.runtimeObservationEntrances
          ]}
          onNavigate={onNavigate}
          t={t}
        />
      </WebSection>
    </Space>
  );
}
