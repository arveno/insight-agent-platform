import { theme } from "antd";

import type { AnalysisWorkspaceController } from "../hooks/useAnalysisWorkspaceController";

import { AnalysisConversationPane } from "./AnalysisConversationPane";

export type AnalysisWorkspaceProps = {
  controller: AnalysisWorkspaceController;
};

export function AnalysisWorkspace({ controller }: AnalysisWorkspaceProps) {
  const { token } = theme.useToken();

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
        <AnalysisConversationPane controller={controller} />
      </div>
    </div>
  );
}
