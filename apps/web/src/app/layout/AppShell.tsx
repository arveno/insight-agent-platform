import { Space, Typography } from "antd";

import { createPrimaryNavigation } from "../router/router";
import { useAppTheme } from "../theme";
import { AppIcon, AppShellLayout, HeaderBar, LeftNav, RightAssistPanel, useI18n } from "../../shared";

export function AppShell() {
  const { locale, t } = useI18n();
  const { themeMode } = useAppTheme();
  const themeModeLabel = t(themeMode === "dark" ? "themeMode.dark" : "themeMode.light");
  const primaryNavigation = createPrimaryNavigation(t);
  const headerActions = (
    <Space size={20}>
      <Typography.Text type="secondary">
        <AppIcon name="language" title={t("language")} />
        {t("language")}: {locale}
      </Typography.Text>
      <Typography.Text type="secondary">
        <AppIcon name="theme" title={t("theme")} />
        {t("theme")}: {themeModeLabel}
      </Typography.Text>
      <Typography.Text type="secondary">
        <AppIcon name="settings" title={t("settings")} />
        {t("settings")}
      </Typography.Text>
    </Space>
  );

  return (
    <AppShellLayout
      header={<HeaderBar actions={headerActions} title={t("app.headerPlaceholder")} />}
      leftNav={
        <Space direction="vertical" size={12} style={{ paddingBlock: 20, width: "100%" }}>
          <Typography.Text strong>{t("appName")}</Typography.Text>
          <LeftNav groups={[{ items: primaryNavigation, key: "primary" }]} selectedKey="dashboard" />
        </Space>
      }
      rightAssistPanel={
        <RightAssistPanel description={t("app.mainPlaceholder")} title={t("app.headerPlaceholder")}>
          <Typography.Paragraph style={{ margin: 0 }} type="secondary">
            {t("app.mainDescription")}
          </Typography.Paragraph>
        </RightAssistPanel>
      }
    >
      <main style={{ padding: 32 }}>
        <Typography.Title level={1}>{t("app.productTitle")}</Typography.Title>
        <Typography.Paragraph style={{ fontSize: 18 }}>{t("app.mainDescription")}</Typography.Paragraph>
        <Typography.Paragraph type="secondary">{t("app.mainPlaceholder")}</Typography.Paragraph>
      </main>
    </AppShellLayout>
  );
}
