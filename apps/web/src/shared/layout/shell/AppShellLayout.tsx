import type { ReactNode } from "react";
import { Layout } from "antd";

import { shellThemeTokens } from "../../theme";

const { Content, Header, Sider } = Layout;

export type AppShellLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  leftNav?: ReactNode;
  mobileTopBar?: ReactNode;
  rightAssistPanel?: ReactNode;
};

/**
 * 全局壳层布局容器。
 *
 * AppShellLayout 只组合 Header、LeftNav、Page Outlet 和辅助面板 slot；
 * 不写死页面业务内容，不读取真实 API，也不解析 raw route / raw response。
 */
export function AppShellLayout({
  children,
  header,
  leftNav,
  mobileTopBar,
  rightAssistPanel
}: AppShellLayoutProps) {
  return (
    <Layout style={{ height: "100vh", minHeight: 0, overflow: "hidden" }}>
      {leftNav ? (
        <Sider
          style={{ height: "100%", overflowX: "hidden", overflowY: "auto" }}
          width={shellThemeTokens.siderWidth}
          theme="light"
        >
          {leftNav}
        </Sider>
      ) : null}
      <Layout style={{ height: "100%", minHeight: 0, minWidth: 0, overflow: "hidden" }}>
        {header ? (
          <Header
            style={{
              background: shellThemeTokens.colorBgContainer,
              borderBottom: `1px solid ${shellThemeTokens.colorBorder}`,
              flex: `0 0 ${shellThemeTokens.headerHeight}px`,
              height: shellThemeTokens.headerHeight,
              lineHeight: `${shellThemeTokens.headerHeight}px`,
              padding: 0
            }}
          >
            {header}
          </Header>
        ) : null}
        {mobileTopBar}
        <Layout
          style={{
            flex: "1 1 auto",
            flexDirection: "row",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden"
          }}
        >
          <Content
            style={{
              background: shellThemeTokens.colorBgLayout,
              minHeight: 0,
              minWidth: 0,
              overflowX: "hidden",
              overflowY: "auto"
            }}
          >
            {children}
          </Content>
          {rightAssistPanel}
        </Layout>
      </Layout>
    </Layout>
  );
}
