import type { ReactNode } from "react";
import { Alert, Button, List, Space, Typography, theme } from "antd";

import type { AnalysisViewModel } from "../../../features/static-view-models";
import { RiskBadge, StatusTag } from "../../../shared";

export type AnalysisSectionsProps = {
  analysisDraft: string;
  composerMode: "analysis" | "follow_up";
  followUpDraft: string;
  interactionMessage: string;
  onAnalysisDraftChange: (value: string) => void;
  onAnalysisSubmit: () => void;
  onComposerModeChange: (mode: "analysis" | "follow_up") => void;
  onFollowUpDraftChange: (value: string) => void;
  onFollowUpSubmit: () => void;
  onSelectAnalysisSuggestion: (value: string) => void;
  onSelectFollowUpSuggestion: (value: string) => void;
  selectedSession: AnalysisViewModel["sessions"][number];
  viewModel: AnalysisViewModel;
};

export function AnalysisSections({
  analysisDraft,
  composerMode,
  followUpDraft,
  interactionMessage,
  onAnalysisDraftChange,
  onAnalysisSubmit,
  onComposerModeChange,
  onFollowUpDraftChange,
  onFollowUpSubmit,
  onSelectAnalysisSuggestion,
  onSelectFollowUpSuggestion,
  selectedSession,
  viewModel
}: AnalysisSectionsProps) {
  const { token } = theme.useToken();
  const contextSummary = selectedSession.contextItems
    .slice(0, 3)
    .map((item) => item.value)
    .join(" / ");
  const hasFollowUpDraft = followUpDraft.trim().length > 0;
  const activeComposer =
    composerMode === "analysis" ? selectedSession.inputComposer : selectedSession.followUpComposer;
  const activeDraft = composerMode === "analysis" ? analysisDraft : followUpDraft;
  const onActiveDraftChange =
    composerMode === "analysis" ? onAnalysisDraftChange : onFollowUpDraftChange;
  const onActiveSubmit = composerMode === "analysis" ? onAnalysisSubmit : onFollowUpSubmit;
  const onSelectSuggestion =
    composerMode === "analysis" ? onSelectAnalysisSuggestion : onSelectFollowUpSuggestion;

  return (
    <section
      aria-label="Analysis conversation"
      role="region"
      style={{
        background: token.colorBgElevated,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        display: "flex",
        flexDirection: "column",
        minHeight: 720,
        overflow: "hidden",
        width: "100%"
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: token.paddingLG
        }}
      >
        <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
          <Space align="start" style={{ justifyContent: "space-between", width: "100%" }} wrap>
            <Space direction="vertical" size={4} style={{ maxWidth: 760 }}>
              <Typography.Text type="secondary">Conversation</Typography.Text>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {selectedSession.session.title}
              </Typography.Title>
              <Typography.Text type="secondary">{selectedSession.session.summary}</Typography.Text>
              <Typography.Text type="secondary">
                当前上下文：{contextSummary || viewModel.contextPanelNote}
              </Typography.Text>
            </Space>
            <Space wrap>
              <StatusTag {...toStatusTagLabel(selectedSession.session.status)} />
              {selectedSession.session.risk ? (
                <RiskBadge {...toRiskBadgeLabel(selectedSession.session.risk)} />
              ) : null}
            </Space>
          </Space>
          <Alert
            message={interactionMessage}
            showIcon
            style={{ borderRadius: token.borderRadiusLG }}
            type="info"
          />
        </Space>
      </header>

      <div
        aria-label="Analysis message list"
        role="log"
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: token.margin,
          minHeight: 0,
          padding: token.paddingLG
        }}
      >
        <ChatMessage
          content={viewModel.contextPanelNote}
          roleLabel="System"
          subtitle={selectedSession.inputComposer.contextHint}
          tone="system"
          title="当前为静态 Analysis UI"
        />
        <ChatMessage
          align="end"
          content={analysisDraft}
          roleLabel="User"
          subtitle={selectedSession.inputComposer.helperText}
          tone="user"
          title="当前分析问题"
        />
        <ChatMessage
          findingBullets={selectedSession.resultSummary.findingBullets.slice(0, 2)}
          note="更完整的 Plan、Evidence、Result 和后续反馈入口已收敛到右侧 Run Trace。"
          roleLabel="Assistant"
          subtitle={selectedSession.runOverview.phaseLabel}
          title="静态分析摘要"
          tone="assistant"
        >
          <Typography.Paragraph style={{ margin: 0 }}>
            {selectedSession.resultSummary.conclusion}
          </Typography.Paragraph>
        </ChatMessage>
        {hasFollowUpDraft ? (
          <ChatMessage
            align="end"
            content={followUpDraft}
            roleLabel="Draft"
            subtitle="当前追问草稿只保留在本地 UI State。"
            tone="draft"
            title="待发送追问"
          />
        ) : null}
      </div>

      <footer
        aria-label="Analysis composer"
        role="group"
        style={{
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: token.paddingLG
        }}
      >
        <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
          <Space wrap>
            <Button
              onClick={() => onComposerModeChange("analysis")}
              type={composerMode === "analysis" ? "primary" : "default"}
            >
              分析问题
            </Button>
            <Button
              onClick={() => onComposerModeChange("follow_up")}
              type={composerMode === "follow_up" ? "primary" : "default"}
            >
              后续追问
            </Button>
          </Space>
          <Space direction="vertical" size={4}>
            <Typography.Text strong>{activeComposer.title}</Typography.Text>
            <Typography.Text type="secondary">{activeComposer.helperText}</Typography.Text>
          </Space>
          <textarea
            aria-label={activeComposer.title}
            onChange={(event) => onActiveDraftChange(event.target.value)}
            placeholder={activeComposer.placeholder}
            rows={4}
            style={{
              background: token.colorBgElevated,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              color: token.colorText,
              fontFamily: "inherit",
              fontSize: token.fontSize,
              lineHeight: token.lineHeight,
              padding: token.padding,
              resize: "vertical",
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
  content,
  findingBullets,
  note,
  roleLabel,
  subtitle,
  title,
  tone
}: {
  align?: "end" | "start";
  children?: ReactNode;
  content?: string;
  findingBullets?: string[];
  note?: string;
  roleLabel: string;
  subtitle?: string;
  title: string;
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
    user: token.colorText
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
        <Typography.Text strong>{title}</Typography.Text>
        {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
        {content ? <Typography.Paragraph style={{ margin: 0 }}>{content}</Typography.Paragraph> : null}
        {children}
        {findingBullets?.length ? (
          <div>
            <Typography.Text strong>关键发现</Typography.Text>
            <List
              dataSource={findingBullets}
              renderItem={(item) => (
                <List.Item style={{ paddingInline: 0, paddingTop: token.marginXS }}>
                  <Typography.Text>{item}</Typography.Text>
                </List.Item>
              )}
              split={false}
            />
          </div>
        ) : null}
        {note ? <Typography.Text type="secondary">{note}</Typography.Text> : null}
      </Space>
    </div>
  );
}

function toStatusTagLabel(status: AnalysisViewModel["sessions"][number]["session"]["status"]) {
  return {
    label:
      status.status === "loading"
        ? "加载中"
        : status.status === "warning"
          ? "注意"
          : status.status === "risk"
            ? "存在风险"
            : status.status === "success"
              ? "成功"
              : "就绪",
    tone:
      status.status === "loading"
        ? "processing"
        : status.status === "warning" || status.status === "risk"
          ? "warning"
          : status.status === "success" || status.status === "ready"
            ? "success"
            : "default"
  } as const;
}

function toRiskBadgeLabel(
  risk: NonNullable<AnalysisViewModel["sessions"][number]["session"]["risk"]>
) {
  const riskLabelByLevel = {
    critical: "严重风险",
    high: "高风险",
    low: "低风险",
    medium: "中风险",
    none: "未知风险"
  } as const;

  return {
    label: risk.title ?? riskLabelByLevel[risk.level],
    level: risk.level === "none" ? "unknown" : risk.level
  } as const;
}
