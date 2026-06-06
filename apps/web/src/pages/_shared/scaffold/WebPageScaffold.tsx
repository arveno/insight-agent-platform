import type { ReactNode } from "react";
import { Space, Typography } from "antd";

import type { StaticPageViewModelBase } from "../../../app/models/staticViewModelTypes";
import { PageHeader } from "../../../shared/layout/containers/PageHeader";
import { ResponsivePageShell } from "../../../shared/layout/containers/ResponsivePageShell";
import { shellThemeTokens } from "../../../shared/theme/tokens";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ActionBar } from "../actions/ActionBar";
import { translateKey } from "../text";
import type { NavigateToRoute } from "../types";

export type WebPageScaffoldProps = {
  children: ReactNode;
  hideHeaderActions?: boolean;
  onNavigate?: NavigateToRoute;
  viewModel: StaticPageViewModelBase;
};

export function WebPageScaffold({
  children,
  hideHeaderActions = false,
  onNavigate,
  viewModel
}: WebPageScaffoldProps) {
  const { t } = useI18n();
  const actions = [viewModel.primaryAction, ...viewModel.secondaryActions];

  return (
    <ResponsivePageShell
      header={
        <PageHeader
          actions={
            hideHeaderActions ? undefined : (
              <ActionBar actions={actions} onNavigate={onNavigate} t={t} />
            )
          }
          meta={
            <Space wrap>
              <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
                {translateKey(t, "chrome.lastUpdated")}: {viewModel.lastUpdatedAt}
              </Typography.Text>
            </Space>
          }
          subtitle={translateKey(t, viewModel.pageDescriptionKey)}
          title={translateKey(t, viewModel.pageTitleKey)}
        />
      }
    >
      <Space direction="vertical" size={shellThemeTokens.pageSectionGap} style={{ width: "100%" }}>
        {children}
      </Space>
    </ResponsivePageShell>
  );
}
