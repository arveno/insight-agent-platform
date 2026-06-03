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
export function AppShellLayout({ children, header, leftNav, mobileTopBar, rightAssistPanel }: AppShellLayoutProps) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {leftNav ? (
        <Sider width={shellThemeTokens.siderWidth} theme="light">
          {leftNav}
        </Sider>
      ) : null}
      <Layout>
        {header ? (
          <Header
            style={{
              background: shellThemeTokens.colorBgContainer,
              borderBottom: `1px solid ${shellThemeTokens.colorBorder}`,
              height: shellThemeTokens.headerHeight,
              padding: 0
            }}
          >
            {header}
          </Header>
        ) : null}
        {mobileTopBar}
        <Layout>
          <Content>{children}</Content>
          {rightAssistPanel}
        </Layout>
      </Layout>
    </Layout>
  );
}
