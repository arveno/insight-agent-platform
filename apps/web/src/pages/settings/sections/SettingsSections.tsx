import { Space } from "antd";

import type { SettingsViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ActionBar } from "../../_shared/actions/ActionBar";
import { MetricCardGrid } from "../../_shared/metrics/MetricCardGrid";
import { SummaryCardGrid } from "../../_shared/lists/SummaryCardGrid";
import { SummaryTable } from "../../_shared/lists/SummaryTable";
import { WebSection } from "../../_shared/sections/WebSection";
import type { WebPageProps } from "../../_shared/types";

export type SettingsSectionsProps = WebPageProps & {
  viewModel: SettingsViewModel;
};

export function SettingsSections({ onNavigate, viewModel }: SettingsSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <SummaryCardGrid items={viewModel.settingsOverview} />
        <MetricCardGrid items={viewModel.metricCards} />
        <ActionBar actions={viewModel.preferenceEntrances} onNavigate={onNavigate} t={t} />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryTable
          items={[
            ...viewModel.securityNotices,
            ...viewModel.defaultPolicySummary,
            ...viewModel.environmentSummary
          ]}
        />
        <ActionBar actions={viewModel.modelRoutingDisplayEntrances} onNavigate={onNavigate} t={t} />
      </WebSection>
    </Space>
  );
}
