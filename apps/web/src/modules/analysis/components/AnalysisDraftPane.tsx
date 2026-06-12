import { Space, Tag, Typography, theme } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { CardSurface } from "../../../shared/ui/surfaces/CardSurface";
import type { AnalysisWorkspaceController } from "../hooks/useAnalysisWorkspaceController";

import { AnalysisComposer } from "./AnalysisComposer";

export type AnalysisDraftPaneProps = {
  controller: Pick<
    AnalysisWorkspaceController,
    | "composerDraft"
    | "composerMode"
    | "composerState"
    | "composerViewModels"
    | "draftContext"
    | "interactionMessage"
    | "modelOptions"
    | "onComposerAccessoryClick"
    | "onComposerDraftChange"
    | "onComposerModeChange"
    | "onComposerStop"
    | "onSelectModel"
    | "onSubmitComposer"
    | "selectedModelKey"
    | "selectedModelLabel"
  >;
};

export function AnalysisDraftPane({ controller }: AnalysisDraftPaneProps) {
  const { token } = theme.useToken();

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
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Typography.Text strong>Draft Context</Typography.Text>
          {controller.draftContext ? (
            <>
              <Typography.Text type="secondary">
                {controller.draftContext.sourceType} · {controller.draftContext.sourceTitle}
              </Typography.Text>
              <Space size={[8, 8]} wrap>
                {controller.draftContext.chips.map((chip) => (
                  <Tag key={chip}>{chip}</Tag>
                ))}
              </Space>
            </>
          ) : (
            <Typography.Text type="secondary">
              当前没有一次性上下文。直接发送前不会创建 Conversation、AnalysisTask 或 AnalysisRun。
            </Typography.Text>
          )}
        </Space>
      </div>

      <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: token.paddingLG }}>
        <ContentCard
          description="发送前保持草稿态；只有用户真正发送后，DraftContextPack 才会固化为一次 AnalysisTask 输入快照。"
          title="新聊天草稿"
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {controller.draftContext ? (
              <>
                <Typography.Text style={{ fontWeight: 600 }}>
                  {controller.draftContext.sourceTitle}
                </Typography.Text>
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {controller.draftContext.summary}
                </Typography.Paragraph>
                <Typography.Text type="secondary">
                  sourceId: {controller.draftContext.sourceId}
                </Typography.Text>
              </>
            ) : (
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                可以从 Dashboard、Metrics、Reports、Evidence 或 Run Trace 带上下文进入，也可以直接从空白草稿开始。
              </Typography.Paragraph>
            )}
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
        selectedSessionComposers={controller.composerViewModels}
      />
    </CardSurface>
  );
}
