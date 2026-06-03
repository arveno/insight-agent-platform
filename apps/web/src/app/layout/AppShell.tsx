import { Layout, Menu, Space, Typography } from "antd";

import { createPrimaryNavigation } from "../router/router";
import { useAppTheme } from "../theme";
import { AppIcon, useI18n } from "../../shared";
import { shellThemeTokens } from "../../shared/theme";

const { Header, Sider, Content } = Layout;

export function AppShell() {
  const { locale, t } = useI18n();
  const { themeMode } = useAppTheme();
  const themeModeLabel = t(themeMode === "dark" ? "themeMode.dark" : "themeMode.light");
  const primaryNavigation = createPrimaryNavigation(t);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={shellThemeTokens.siderWidth} theme="light">
        <div style={{ padding: 20 }}>
          <Typography.Text strong>{t("appName")}</Typography.Text>
        </div>
        <Menu mode="inline" defaultSelectedKeys={["dashboard"]} items={primaryNavigation} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: shellThemeTokens.colorBgContainer,
            borderBottom: `1px solid ${shellThemeTokens.colorBorder}`,
            display: "flex",
            height: shellThemeTokens.headerHeight,
            justifyContent: "space-between",
            padding: "0 24px"
          }}
        >
          <Typography.Text strong>{t("app.headerPlaceholder")}</Typography.Text>
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
        </Header>
        <Content style={{ padding: 32 }}>
          <Typography.Title level={1}>{t("app.productTitle")}</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 18 }}>{t("app.mainDescription")}</Typography.Paragraph>
          <Typography.Paragraph type="secondary">{t("app.mainPlaceholder")}</Typography.Paragraph>
        </Content>
      </Layout>
    </Layout>
  );
}
