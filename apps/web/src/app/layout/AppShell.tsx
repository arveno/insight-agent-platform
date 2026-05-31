import { Layout, Menu, Typography } from "antd";

import { primaryNavigation } from "../router/router";

const { Header, Sider, Content } = Layout;

export function AppShell() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={260} theme="light">
        <div style={{ padding: 20 }}>
          <Typography.Text strong>Insight Agent</Typography.Text>
        </div>
        <Menu mode="inline" defaultSelectedKeys={["dashboard"]} items={primaryNavigation} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            padding: "0 24px"
          }}
        >
          <Typography.Text strong>顶部 Header 占位</Typography.Text>
        </Header>
        <Content style={{ padding: 32 }}>
          <Typography.Title level={1}>Insight Agent Platform</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 18 }}>
            企业经营分析与决策 Agent 平台
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary">
            主内容区占位：后续功能必须在已审查通过的 Issue 范围内接入。
          </Typography.Paragraph>
        </Content>
      </Layout>
    </Layout>
  );
}
