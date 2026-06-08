import type { ReactNode } from "react";
import { Flex, Space, Typography } from "antd";

import { useI18n } from "../../i18n/I18nProvider";
import { translateKey } from "../../i18n/translateKey";
import { createNavigationActionsFromViewModel } from "../../navigation/createRouteAction";
import { NavigationActionButton } from "../../navigation/NavigationActionButton";
import type { NavigateToRoute } from "../../navigation/navigationTypes";
import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import type { StaticPageViewModelBase } from "../../view-model/staticViewModelTypes";
import { PageHeader } from "./PageHeader";
import { ResponsivePageShell } from "./ResponsivePageShell";

export type PageScaffoldProps = {
  children: ReactNode;
  hideHeaderActions?: boolean;
  onNavigate?: NavigateToRoute;
  viewModel: StaticPageViewModelBase;
};

export function PageScaffold({
  children,
  hideHeaderActions = false,
  onNavigate,
  viewModel
}: PageScaffoldProps) {
  const { t } = useI18n();
  const actions = createNavigationActionsFromViewModel(
    [viewModel.primaryAction, ...viewModel.secondaryActions],
    onNavigate,
    t
  );

  return (
    <ResponsivePageShell
      header={
        <PageHeader
          actions={
            hideHeaderActions ? undefined : (
              <Flex gap={12} wrap>
                {actions.map((action) => (
                  <NavigationActionButton action={action} key={action.key} />
                ))}
              </Flex>
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
