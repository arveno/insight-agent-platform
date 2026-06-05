import type { ReactNode } from "react";
import { ArrowUpOutlined, DownOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Dropdown, List, Space, Typography, theme } from "antd";

import type { AnalysisViewModel } from "../../../features/static-view-models";
import { shellTypographyStyles } from "../../../shared";

export type AnalysisSectionsProps = {
  analysisDraft: string;
  composerState: "idle" | "running";
  composerMode: "analysis" | "follow_up";
  followUpDraft: string;
  interactionMessage: string;
  modelOptions: readonly { key: string; label: string }[];
  onAnalysisDraftChange: (value: string) => void;
  onAnalysisSubmit: () => void;
  onComposerAccessoryClick: () => void;
  onFollowUpDraftChange: (value: string) => void;
  onFollowUpSubmit: () => void;
  onComposerStop: () => void;
  onSelectModel: (key: string) => void;
  selectedModelKey: string;
  selectedModelLabel: string;
  selectedSession: AnalysisViewModel["sessions"][number];
};

export function AnalysisSections({
  analysisDraft,
  composerState,
  composerMode,
  followUpDraft,
  interactionMessage,
  modelOptions,
  onAnalysisDraftChange,
  onAnalysisSubmit,
  onComposerAccessoryClick,
  onFollowUpDraftChange,
  onFollowUpSubmit,
  onComposerStop,
  onSelectModel,
  selectedModelKey,
  selectedModelLabel,
  selectedSession
}: AnalysisSectionsProps) {
  const { token } = theme.useToken();
  const activeComposer =
    composerMode === "analysis" ? selectedSession.inputComposer : selectedSession.followUpComposer;
  const activeDraft = composerMode === "analysis" ? analysisDraft : followUpDraft;
  const onActiveDraftChange =
    composerMode === "analysis" ? onAnalysisDraftChange : onFollowUpDraftChange;
  const onActiveSubmit = composerMode === "analysis" ? onAnalysisSubmit : onFollowUpSubmit;
  const modelMenuItems = modelOptions.map((option) => ({
    key: option.key,
    label: option.label
  }));
  const committedUserMessage = selectedSession.inputComposer.initialDraft;

  return (
    <section
      aria-label="Analysis conversation"
      role="region"
      style={{
        background: token.colorBgElevated,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        display: "flex",
        flex: "1 1 auto",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        width: "100%"
      }}
    >
      <div
        style={{
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          paddingBlock: token.paddingSM,
          paddingInline: token.paddingLG
        }}
      >
        <Typography.Text type="secondary">{selectedSession.contextPack.stripText}</Typography.Text>
      </div>

      <div
        aria-label="Analysis message list"
        role="log"
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: token.margin,
          minHeight: 0,
          overflowY: "auto",
          padding: token.paddingLG
        }}
      >
        <ChatMessage roleLabel="System" tone="system">
          <Typography.Paragraph style={{ margin: 0 }}>
            {selectedSession.contextPack.systemText}
          </Typography.Paragraph>
          <Typography.Text type="secondary">
            {selectedSession.contextPack.stripText}
          </Typography.Text>
        </ChatMessage>

        <ChatMessage align="end" roleLabel="User" tone="user">
          <Typography.Paragraph style={{ margin: 0 }}>{committedUserMessage}</Typography.Paragraph>
        </ChatMessage>

        <ChatMessage roleLabel="Assistant" tone="assistant">
          <Typography.Paragraph style={{ margin: 0 }}>
            {selectedSession.resultSummary.conclusion}
          </Typography.Paragraph>
          <div>
            <Typography.Text style={shellTypographyStyles.cardTitle}>关键发现</Typography.Text>
            <List
              dataSource={selectedSession.resultSummary.findingBullets.slice(0, 2)}
              renderItem={(item) => (
                <List.Item style={{ paddingInline: 0, paddingTop: token.marginXS }}>
                  <Typography.Text>{item}</Typography.Text>
                </List.Item>
              )}
              split={false}
            />
          </div>
          <Typography.Text type="secondary">完整执行过程见右侧 Run Trace。</Typography.Text>
        </ChatMessage>
      </div>

      <footer
        aria-label="Analysis composer"
        role="group"
        style={{
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          flex: "0 0 auto",
          padding: token.paddingLG
        }}
      >
        <div
          style={{
            background: token.colorBgElevated,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            padding: token.paddingSM
          }}
        >
          <textarea
            aria-label={activeComposer.title}
            onChange={(event) => onActiveDraftChange(event.target.value)}
            placeholder={activeComposer.placeholder}
            rows={4}
            style={{
              background: "transparent",
              border: "none",
              color: token.colorText,
              display: "block",
              fontFamily: "inherit",
              fontSize: token.fontSize,
              lineHeight: token.lineHeight,
              marginBottom: token.marginSM,
              minHeight: 96,
              outline: "none",
              padding: 0,
              resize: "none",
              width: "100%"
            }}
            value={activeDraft}
          />
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: token.marginSM,
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            <Button
              aria-label="打开聊天工具入口"
              color="default"
              icon={<PlusOutlined />}
              onClick={onComposerAccessoryClick}
              shape="circle"
              type="default"
            />
            <Space size={token.marginSM}>
              <Dropdown
                menu={{
                  items: modelMenuItems,
                  onClick: ({ key }) => onSelectModel(String(key)),
                  selectable: true,
                  selectedKeys: [selectedModelKey]
                }}
                trigger={["click"]}
              >
                <Button aria-label="选择模型" type="default">
                  {selectedModelLabel}
                  <DownOutlined />
                </Button>
              </Dropdown>
              <Button
                aria-label={composerState === "running" ? "停止生成" : "发送消息"}
                color="default"
                disabled={composerState === "idle" && activeDraft.trim().length === 0}
                icon={composerState === "running" ? <StopOutlined /> : <ArrowUpOutlined />}
                onClick={composerState === "running" ? onComposerStop : onActiveSubmit}
                shape="circle"
                variant="solid"
              />
            </Space>
          </div>
        </div>
        <span
          aria-live="polite"
          style={{
            border: 0,
            clip: "rect(0 0 0 0)",
            height: 1,
            margin: -1,
            overflow: "hidden",
            padding: 0,
            position: "absolute",
            whiteSpace: "nowrap",
            width: 1
          }}
        >
          {interactionMessage}
        </span>
      </footer>
    </section>
  );
}

function ChatMessage({
  align = "start",
  children,
  roleLabel,
  tone
}: {
  align?: "end" | "start";
  children: ReactNode;
  roleLabel: string;
  tone: "assistant" | "draft" | "system" | "user";
}) {
  const { token } = theme.useToken();
  const backgroundByTone = {
    assistant: token.colorBgContainer,
    draft: token.colorFillSecondary,
    system: token.colorFillAlter,
    user: token.colorFillTertiary
  };
  const borderByTone = {
    assistant: token.colorBorderSecondary,
    draft: token.colorBorder,
    system: token.colorBorderSecondary,
    user: token.colorBorder
  };

  return (
    <div
      style={{
        alignSelf: align === "end" ? "flex-end" : "flex-start",
        background: backgroundByTone[tone],
        border: `1px solid ${borderByTone[tone]}`,
        borderRadius: token.borderRadiusLG,
        maxWidth: "78%",
        padding: token.paddingLG
      }}
    >
      <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
        <Typography.Text type="secondary">{roleLabel}</Typography.Text>
        {children}
      </Space>
    </div>
  );
}
