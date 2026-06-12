import { theme } from "antd";

import { EmptyState } from "../../../shared/ui/states/EmptyState";
import { ErrorState } from "../../../shared/ui/states/ErrorState";
import { LoadingState } from "../../../shared/ui/states/LoadingState";
import type { AnalysisWorkspaceController } from "../hooks/useAnalysisWorkspaceController";

import { AnalysisConversationPane } from "./AnalysisConversationPane";
import { AnalysisDraftPane } from "./AnalysisDraftPane";

export type AnalysisWorkspaceProps = {
  controller: AnalysisWorkspaceController;
};

export function AnalysisWorkspace({ controller }: AnalysisWorkspaceProps) {
  const { token } = theme.useToken();
  const content =
    controller.workspaceState.kind === "loading" ? (
      <LoadingState label={controller.workspaceState.title} />
    ) : controller.workspaceState.kind === "error" ? (
      <ErrorState
        description={controller.workspaceState.description}
        title={controller.workspaceState.title}
      />
    ) : controller.workspaceState.kind === "empty" ? (
      <EmptyState
        description={controller.workspaceState.description}
        title={controller.workspaceState.title}
      />
    ) : controller.workspaceState.kind === "draft" ? (
      <AnalysisDraftPane controller={controller} />
    ) : (
      <AnalysisConversationPane controller={controller} />
    );

  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: token.paddingLG,
        width: "100%"
      }}
    >
      <div style={{ display: "flex", flex: "1 1 auto", minHeight: 0, minWidth: 0 }}>
        {content}
      </div>
    </div>
  );
}
