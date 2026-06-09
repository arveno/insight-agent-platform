import { theme } from "antd";

import type { AnalysisMessage } from "../models/analysisMessage";

import { AnalysisMessageItem } from "./AnalysisMessageItem";

export type AnalysisMessageListProps = {
  messages: AnalysisMessage[];
};

export function AnalysisMessageList({ messages }: AnalysisMessageListProps) {
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
        <AnalysisMessageItem key={message.messageId} message={message} />
      ))}
    </div>
  );
}
