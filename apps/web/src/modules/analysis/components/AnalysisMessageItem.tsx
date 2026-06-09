import { List, Space, Typography, theme } from "antd";

import type { AnalysisMessage } from "../models/analysisMessage";

function getRoleLabel(role: AnalysisMessage["role"]): string {
  switch (role) {
    case "assistant":
      return "Assistant";
    case "system":
      return "System";
    case "tool":
      return "Tool";
    case "user":
      return "User";
  }
}

function getTone(role: AnalysisMessage["role"]): "assistant" | "system" | "user" {
  switch (role) {
    case "assistant":
      return "assistant";
    case "system":
    case "tool":
      return "system";
    case "user":
      return "user";
  }
}

export type AnalysisMessageItemProps = {
  message: AnalysisMessage;
};

export function AnalysisMessageItem({ message }: AnalysisMessageItemProps) {
  const { token } = theme.useToken();
  const tone = getTone(message.role);
  const backgroundByTone = {
    assistant: token.colorBgContainer,
    system: token.colorFillAlter,
    user: token.colorFillTertiary
  };
  const borderByTone = {
    assistant: token.colorBorderSecondary,
    system: token.colorBorderSecondary,
    user: token.colorBorder
  };

  return (
    <div
      style={{
        alignSelf: message.role === "user" ? "flex-end" : "flex-start",
        background: backgroundByTone[tone],
        border: `1px solid ${borderByTone[tone]}`,
        borderRadius: token.borderRadiusLG,
        maxWidth: "78%",
        padding: token.paddingLG
      }}
    >
      <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
        <Typography.Text type="secondary">{getRoleLabel(message.role)}</Typography.Text>
        <Typography.Paragraph style={{ margin: 0 }}>{message.content}</Typography.Paragraph>
        {message.supportingItems?.length ? (
          <div>
            <Typography.Text style={{ fontWeight: token.fontWeightStrong }}>
              {message.supportingTitle ?? "支持信息"}
            </Typography.Text>
            <List
              dataSource={message.supportingItems}
              renderItem={(item) => (
                <List.Item style={{ paddingInline: 0, paddingTop: token.marginXS }}>
                  <Typography.Text>{item}</Typography.Text>
                </List.Item>
              )}
              split={false}
            />
          </div>
        ) : null}
        {message.metaText ? (
          <Typography.Text type="secondary">{message.metaText}</Typography.Text>
        ) : null}
        {message.footerText ? (
          <Typography.Text type="secondary">{message.footerText}</Typography.Text>
        ) : null}
      </Space>
    </div>
  );
}
