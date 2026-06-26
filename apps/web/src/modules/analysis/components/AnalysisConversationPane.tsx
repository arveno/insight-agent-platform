import { Button, Input, Radio, Space, Typography, theme } from "antd";

import { CardSurface } from "../../../shared/ui/surfaces/CardSurface";
import type { AnalysisWorkspaceController } from "../hooks/useAnalysisWorkspaceController";
import type { Feedback } from "../models/runtimeContractTypes";

import { AnalysisComposer } from "./AnalysisComposer";
import { AnalysisMessageList } from "./AnalysisMessageList";

export type AnalysisConversationPaneProps = {
  controller: Pick<
    AnalysisWorkspaceController,
    | "composerDraft"
    | "composerMode"
    | "composerState"
    | "composerViewModels"
    | "feedbackComment"
    | "feedbackSubmitState"
    | "feedbackType"
    | "interactionMessage"
    | "messages"
    | "modelOptions"
    | "onComposerAccessoryClick"
    | "onComposerDraftChange"
    | "onComposerModeChange"
    | "onComposerStop"
    | "onFeedbackCommentChange"
    | "onFeedbackTypeChange"
    | "onSelectCurrentRun"
    | "onSelectMessageAnchor"
    | "onSelectModel"
    | "onSubmitComposer"
    | "onSubmitFeedback"
    | "selectedModelKey"
    | "selectedModelLabel"
    | "selectedMessageId"
    | "selectedSession"
  >;
};

const feedbackOptions: { label: string; value: Feedback["feedbackType"] }[] = [
  { label: "有帮助", value: "useful" },
  { label: "需要修正", value: "incorrect" }
];

function formatFeedbackType(type: Feedback["feedbackType"] | undefined): string {
  switch (type) {
    case "useful":
      return "有帮助";
    case "incorrect":
      return "需要修正";
    case undefined:
      return "暂无";
    default:
      return type;
  }
}

function formatFeedbackClosureSummary(
  session: NonNullable<AnalysisWorkspaceController["selectedSession"]>
): string {
  if (session.feedbackClosure.state === "notImplemented") {
    return "Feedback closure not implemented";
  }

  if (session.feedbackClosure.state === "unavailable") {
    return "Feedback closure unavailable";
  }

  return `Feedback ${session.feedbackClosure.feedbackCount} · BadCase ${session.feedbackClosure.badCaseCount} · EvaluationRun ${session.feedbackClosure.evaluationRunCount}`;
}

export function AnalysisConversationPane({ controller }: AnalysisConversationPaneProps) {
  const { token } = theme.useToken();
  const session = controller.selectedSession;

  if (!session) {
    return null;
  }

  const showRunStartState =
    session.currentRun.status === "created" &&
    !session.messages.some((message) => message.role === "assistant");

  return (
    <CardSurface
      aria-label="Analysis conversation"
      role="region"
      style={{
        display: "flex",
        flex: "1 1 auto",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        width: "100%"
      }}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          padding: 0
        }
      }}
    >
      {showRunStartState ? (
        <button
          onClick={controller.onSelectCurrentRun}
          style={{
            background: "transparent",
            border: 0,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            cursor: "pointer",
            padding: token.paddingLG,
            textAlign: "left",
            width: "100%"
          }}
          type="button"
        >
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Typography.Text strong>
              {`Run ${session.currentRun.status} · ${session.currentRun.phase}`}
            </Typography.Text>
            <Typography.Text type="secondary">{session.currentRun.stageSummary}</Typography.Text>
          </Space>
        </button>
      ) : null}

      <AnalysisMessageList
        messages={controller.messages}
        onSelectMessageAnchor={controller.onSelectMessageAnchor}
        selectedMessageId={controller.selectedMessageId}
      />

      {session.reportPreview ? (
        <div
          aria-label="Analysis report feedback"
          role="region"
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            padding: token.paddingLG
          }}
        >
          <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
            <Space align="baseline" style={{ justifyContent: "space-between", width: "100%" }}>
              <Typography.Text strong>结果反馈</Typography.Text>
              <Typography.Text type="secondary">{session.reportPreview.title}</Typography.Text>
            </Space>
            <Typography.Text type="secondary">
              {formatFeedbackClosureSummary(session)}
            </Typography.Text>
            <Typography.Text type="secondary">
              {`最新: ${formatFeedbackType(session.feedbackClosure.latestFeedbackType)} · ${session.feedbackClosure.latestEvaluationStatus ?? "暂无"}`}
            </Typography.Text>
            <Radio.Group
              disabled={controller.feedbackSubmitState === "submitting"}
              onChange={(event) =>
                controller.onFeedbackTypeChange(event.target.value as Feedback["feedbackType"])
              }
              options={feedbackOptions}
              value={controller.feedbackType ?? undefined}
            />
            <Input.TextArea
              aria-label="反馈说明"
              autoSize={{ minRows: 2, maxRows: 4 }}
              disabled={controller.feedbackSubmitState === "submitting"}
              onChange={(event) => controller.onFeedbackCommentChange(event.target.value)}
              value={controller.feedbackComment}
            />
            <Button
              disabled={!controller.feedbackType}
              loading={controller.feedbackSubmitState === "submitting"}
              onClick={controller.onSubmitFeedback}
              type="primary"
            >
              提交反馈
            </Button>
          </Space>
        </div>
      ) : null}

      {(controller.interactionMessage || session.messageStream) && (
        <div
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            padding: token.paddingLG
          }}
        >
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            {controller.interactionMessage ? (
              <Typography.Text type="secondary">{controller.interactionMessage}</Typography.Text>
            ) : null}
            {session.messageStream ? (
              <Typography.Text type="secondary">
                Stream {session.messageStream.status} · {session.messageStream.updatedAtText}
              </Typography.Text>
            ) : null}
          </Space>
        </div>
      )}

      <AnalysisComposer
        composerDraft={controller.composerDraft}
        composerMode={controller.composerMode}
        composerState={controller.composerState}
        interactionMessage={controller.interactionMessage}
        modelOptions={controller.modelOptions}
        onComposerAccessoryClick={controller.onComposerAccessoryClick}
        onComposerDraftChange={controller.onComposerDraftChange}
        onComposerModeChange={controller.onComposerModeChange}
        onComposerStop={controller.onComposerStop}
        onSelectModel={controller.onSelectModel}
        onSubmitComposer={controller.onSubmitComposer}
        selectedModelKey={controller.selectedModelKey}
        selectedModelLabel={controller.selectedModelLabel}
        selectedSessionComposers={controller.composerViewModels}
      />
    </CardSurface>
  );
}
