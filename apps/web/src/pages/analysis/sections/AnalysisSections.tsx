import type { ReactNode } from "react";
import { Button, List, Space, Typography, theme } from "antd";

import type { AnalysisViewModel } from "../../../features/static-view-models";

export type AnalysisSectionsProps = {
  analysisDraft: string;
  composerMode: "analysis" | "follow_up";
  followUpDraft: string;
  interactionMessage: string;
  onAnalysisDraftChange: (value: string) => void;
  onAnalysisSubmit: () => void;
  onFollowUpDraftChange: (value: string) => void;
  onFollowUpSubmit: () => void;
  onSelectAnalysisSuggestion: (value: string) => void;
  onSelectFollowUpSuggestion: (value: string) => void;
  selectedSession: AnalysisViewModel["sessions"][number];
};

export function AnalysisSections({
  analysisDraft,
  composerMode,
  followUpDraft,
  interactionMessage,
  onAnalysisDraftChange,
  onAnalysisSubmit,
  onFollowUpDraftChange,
  onFollowUpSubmit,
  onSelectAnalysisSuggestion,
  onSelectFollowUpSuggestion,
  selectedSession
}: AnalysisSectionsProps) {
  const { token } = theme.useToken();
  const activeComposer =
    composerMode === "analysis" ? selectedSession.inputComposer : selectedSession.followUpComposer;
  const activeDraft = composerMode === "analysis" ? analysisDraft : followUpDraft;
  const onActiveDraftChange =
    composerMode === "analysis" ? onAnalysisDraftChange : onFollowUpDraftChange;
  const onActiveSubmit = composerMode === "analysis" ? onAnalysisSubmit : onFollowUpSubmit;
  const onSelectSuggestion =
    composerMode === "analysis" ? onSelectAnalysisSuggestion : onSelectFollowUpSuggestion;
  const hasFollowUpDraft = composerMode === "follow_up" && followUpDraft.trim().length > 0;

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
        <ChatMessage
          roleLabel="System"
          tone="system"
        >
          <Typography.Paragraph style={{ margin: 0 }}>
            {selectedSession.contextPack.systemText}
          </Typography.Paragraph>
          <Typography.Text type="secondary">{selectedSession.contextPack.stripText}</Typography.Text>
        </ChatMessage>

        <ChatMessage align="end" roleLabel="User" tone="user">
          <Typography.Paragraph style={{ margin: 0 }}>{analysisDraft}</Typography.Paragraph>
        </ChatMessage>

        <ChatMessage roleLabel="Assistant" tone="assistant">
          <Typography.Paragraph style={{ margin: 0 }}>
            {selectedSession.resultSummary.conclusion}
          </Typography.Paragraph>
          <div>
            <Typography.Text strong>关键发现</Typography.Text>
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

        {hasFollowUpDraft ? (
          <ChatMessage align="end" roleLabel="Draft" tone="draft">
            <Typography.Paragraph style={{ margin: 0 }}>{followUpDraft}</Typography.Paragraph>
          </ChatMessage>
        ) : null}
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
        <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
          <Typography.Text type="secondary">{interactionMessage}</Typography.Text>
          <textarea
            aria-label={activeComposer.title}
            onChange={(event) => onActiveDraftChange(event.target.value)}
            placeholder={activeComposer.placeholder}
            rows={3}
            style={{
              background: token.colorBgElevated,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              color: token.colorText,
              fontFamily: "inherit",
              fontSize: token.fontSize,
              lineHeight: token.lineHeight,
              padding: token.padding,
              resize: "none",
              width: "100%"
            }}
            value={activeDraft}
          />
          <Space wrap>
            {activeComposer.suggestions.map((suggestion) => (
              <Button
                key={suggestion.key}
                onClick={() => onSelectSuggestion(suggestion.label)}
                size="small"
                type="default"
              >
                {suggestion.label}
              </Button>
            ))}
          </Space>
          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }} wrap>
            <Typography.Text type="secondary">{activeComposer.contextHint}</Typography.Text>
            <Button
              color="default"
              disabled={activeDraft.trim().length === 0}
              onClick={onActiveSubmit}
              variant="solid"
            >
              {activeComposer.submitLabel}
            </Button>
          </Space>
        </Space>
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
