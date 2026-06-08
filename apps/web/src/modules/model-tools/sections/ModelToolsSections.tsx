import { Space } from "antd";

import { ActionBar } from "../../../app/router/RouteActionBar";
import type { WebPageProps } from "../../../app/router/pageProps";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { TabsPanel } from "../../../shared/layout/overlays/StaticTabsPanel";
import { WebSection } from "../../../shared/layout/sections/WebSection";
import { MetricCardGrid } from "../../../shared/ui/cards/MetricCardGrid";
import { SummaryCardGrid } from "../../../shared/ui/data/SummaryCardGrid";
import { SummaryTable } from "../../../shared/ui/data/SummaryTable";

import type { ModelToolsViewModel } from "../models/modelToolsViewModel";

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
