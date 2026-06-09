import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";
import type { AnalysisMessage } from "../models/analysisMessage";

import { AnalysisMessageList } from "./AnalysisMessageList";

afterEach(cleanup);

const customMessages: AnalysisMessage[] = [
  {
    content: "只渲染传入的 assistant 消息。",
    completedAt: "2026-06-09T10:00:10+08:00",
    conversationId: "conversation-custom",
    createdAt: "2026-06-09T10:00:00+08:00",
    messageId: "message-assistant-only",
    reportId: null,
    role: "assistant",
    runId: "analysis-custom",
    sourceEvidenceIds: [],
    status: "completed",
    toolCallIds: [],
    turnId: "turn-conversation-custom-1"
  }
];

describe("AnalysisMessageList", () => {
  it("renders from messages instead of hardcoded system/user/assistant items", () => {
    render(
      <TestProviders>
        <AnalysisMessageList messages={customMessages} />
      </TestProviders>
    );

    const log = screen.getByRole("log", { name: "Analysis message list" });

    expect(log).toBeTruthy();
    expect(screen.getByText("Assistant")).toBeTruthy();
    expect(screen.getByText("只渲染传入的 assistant 消息。")).toBeTruthy();
    expect(screen.queryByText("System")).toBeNull();
    expect(screen.queryByText("User")).toBeNull();
  });
});
