import { Space, Typography, theme } from "antd";
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
          alignItems: "center",
          display: "flex",
          flex: "1 1 auto",
          justifyContent: "center",
          minHeight: 0,
          overflowY: "auto",
          padding: token.paddingLG
        }}
      >
        <Space align="center" direction="vertical" size={8} style={{ textAlign: "center" }}>
          <Typography.Text type="secondary">输入问题开始分析</Typography.Text>
          {controller.interactionMessage ? (
            <Typography.Text type="secondary">{controller.interactionMessage}</Typography.Text>
          ) : null}
        </Space>
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
