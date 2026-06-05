import type { ReactNode } from "react";
import { Space, Typography } from "antd";

import type { StaticPageViewModelBase } from "../../../app/models";
import {
  PageHeader,
  ResponsivePageShell,
  shellThemeTokens,
  shellTypographyStyles,
  useI18n
} from "../../../shared";
import { ActionBar } from "../actions";
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
