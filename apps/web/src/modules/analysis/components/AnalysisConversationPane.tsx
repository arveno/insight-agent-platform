import { Button, Space, Typography, theme } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
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
    | "interactionMessage"
    | "messages"
    | "modelOptions"
    | "onOpenInspectorPanel"
    | "onComposerAccessoryClick"
    | "onComposerDraftChange"
    | "onComposerModeChange"
    | "onComposerStop"
    | "onSelectModel"
    | "onSubmitComposer"
    | "selectedModelKey"
    | "selectedModelLabel"
    | "selectedSession"
  >;
};

export function AnalysisConversationPane({ controller }: AnalysisConversationPaneProps) {
  const { token } = theme.useToken();
  const session = controller.selectedSession;

  if (!session) {
    return null;
  }

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
      <div
        style={{
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          paddingBlock: token.paddingSM,
          paddingInline: token.paddingLG
        }}
      >
        <Typography.Text type="secondary">
          {session.contextPack.stripText}
        </Typography.Text>
      </div>

      <AnalysisMessageList messages={controller.messages} />

      <div
        style={{
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          display: "grid",
          gap: token.marginSM,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          padding: token.paddingLG
        }}
      >
        {session.messageStream ? (
          <ContentCard
            description={session.messageStream.updatedAtText}
            eyebrow={`messageId: ${session.messageStream.messageId}`}
            title="Message Stream Replay"
          >
            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary">
                Status: {session.messageStream.status}
              </Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {session.messageStream.replayText || "当前没有可回放的 delta。"}
              </Typography.Paragraph>
            </Space>
          </ContentCard>
        ) : null}

        <ContentCard
          description={session.resultSummary.evidenceSummary}
          footerActions={
            <Space wrap>
              <Button onClick={() => controller.onOpenInspectorPanel("run-trace")} type="default">
                Run Trace
              </Button>
              <Button onClick={() => controller.onOpenInspectorPanel("tool-detail")} type="default">
                Tool / Model
              </Button>
              <Button
                onClick={() => controller.onOpenInspectorPanel("source-evidence")}
                type="default"
              >
                Evidence
              </Button>
              <Button
                onClick={() => controller.onOpenInspectorPanel("report-preview")}
                type="default"
              >
                Report
              </Button>
              <Button
                onClick={() => controller.onOpenInspectorPanel("decision-detail")}
                type="default"
              >
                Decision
              </Button>
            </Space>
          }
          title={session.resultSummary.title}
        >
          <Space direction="vertical" size={4}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {session.resultSummary.conclusion}
            </Typography.Paragraph>
            {session.resultSummary.actionSuggestions.length > 0 ? (
              <Typography.Text type="secondary">
                {session.resultSummary.actionSuggestions.join(" / ")}
              </Typography.Text>
            ) : null}
          </Space>
        </ContentCard>
      </div>

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
        selectedSessionComposers={{
          analysis: session.inputComposer,
          followUp: session.followUpComposer
        }}
      />
    </CardSurface>
  );
}
