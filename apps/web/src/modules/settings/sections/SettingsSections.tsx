import { Space } from "antd";

import { ActionBar } from "../../../app/router/RouteActionBar";
import type { WebPageProps } from "../../../app/router/pageProps";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { WebSection } from "../../../shared/layout/sections/WebSection";
import { MetricCardGrid } from "../../../shared/ui/cards/MetricCardGrid";
import { SummaryCardGrid } from "../../../shared/ui/data/SummaryCardGrid";
import { SummaryTable } from "../../../shared/ui/data/SummaryTable";

import type { SettingsViewModel } from "../models/settingsViewModel";

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
