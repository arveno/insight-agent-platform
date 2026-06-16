import { Space, Typography, theme } from "antd";

import { CardSurface } from "../../../shared/ui/surfaces/CardSurface";
import type { AnalysisWorkspaceController } from "../hooks/useAnalysisWorkspaceController";

import { AnalysisComposer } from "./AnalysisComposer";
import { AnalysisMessageList } from "./AnalysisMessageList";

export type AnalysisConversationPaneProps = {
  controller: Pick<
    AnalysisWorkspaceController,
    | "composerDraft"
    | "composerMode"
    | "composerState"
    | "composerViewModels"
    | "interactionMessage"
    | "messages"
    | "modelOptions"
    | "onComposerAccessoryClick"
    | "onComposerDraftChange"
    | "onComposerModeChange"
    | "onComposerStop"
    | "onSelectCurrentRun"
    | "onSelectMessageAnchor"
    | "onSelectModel"
    | "onSubmitComposer"
    | "selectedModelKey"
    | "selectedModelLabel"
    | "selectedMessageId"
    | "selectedSession"
  >;
};

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
