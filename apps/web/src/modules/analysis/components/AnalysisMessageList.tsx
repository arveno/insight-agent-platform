import { theme } from "antd";

import type { AnalysisMessage } from "../models/analysisMessage";

import { AnalysisMessageItem } from "./AnalysisMessageItem";

export type AnalysisMessageListProps = {
  messages: AnalysisMessage[];
  onSelectMessageAnchor: (messageId: string) => void;
  selectedMessageId: string | null;
};

function canSelectMessageAnchor(message: AnalysisMessage): boolean {
  return message.analysisTaskId != null && message.role === "assistant" && message.runId != null;
}

export function AnalysisMessageList({
  messages,
  onSelectMessageAnchor,
  selectedMessageId
}: AnalysisMessageListProps) {
  const { token } = theme.useToken();

  return (
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
        {messages.map((message) => (
          <AnalysisMessageItem
            isSelected={selectedMessageId === message.messageId}
            key={message.messageId}
            message={message}
            onSelect={
              canSelectMessageAnchor(message) ? () => onSelectMessageAnchor(message.messageId) : undefined
            }
          />
        ))}
    </div>
  );
}
