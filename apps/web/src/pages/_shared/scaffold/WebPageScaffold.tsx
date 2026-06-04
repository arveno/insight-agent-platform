import type { ReactNode } from "react";
import { Space, Typography } from "antd";

import type { StaticPageViewModelBase } from "../../../app/models";
import {
  PageHeader,
  ResponsivePageShell,
  StatusTag,
  WarningRiskBanner,
  useI18n
} from "../../../shared";
import { ActionBar } from "../actions";
import { toStatusTag } from "../adapters";
import { StateCoveragePanel } from "../panels";
import { translateKey } from "../text";
import type { NavigateToRoute } from "../types";

export type WebPageScaffoldProps = {
  children: ReactNode;
  onNavigate?: NavigateToRoute;
  viewModel: StaticPageViewModelBase;
};

export function WebPageScaffold({ children, onNavigate, viewModel }: WebPageScaffoldProps) {
  const { t } = useI18n();
  const actions = [viewModel.primaryAction, ...viewModel.secondaryActions];

  return (
    <ResponsivePageShell
      header={
        <PageHeader
          actions={<ActionBar actions={actions} onNavigate={onNavigate} t={t} />}
          meta={
            <Space wrap>
              <StatusTag
                {...toStatusTag(t, {
                  labelKey: viewModel.stateCoverage.ready.titleKey,
                  status: viewModel.stateCoverage.ready.kind
                })!}
              />
              <Typography.Text type="secondary">
                {translateKey(t, "chrome.lastUpdated")}: {viewModel.lastUpdatedAt}
              </Typography.Text>
            </Space>
          }
          subtitle={translateKey(t, viewModel.pageDescriptionKey)}
          title={translateKey(t, viewModel.pageTitleKey)}
        />
      }
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {viewModel.gapNote ? (
          <WarningRiskBanner
            description={viewModel.gapNote}
            message={translateKey(t, "surface.gap.title")}
            riskLevel="medium"
          />
        ) : null}
        {children}
        <StateCoveragePanel coverage={viewModel.stateCoverage} />
      </Space>
    </ResponsivePageShell>
  );
}
