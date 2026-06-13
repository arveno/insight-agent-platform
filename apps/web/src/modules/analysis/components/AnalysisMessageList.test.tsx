import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";
import type { AnalysisMessage } from "../models/analysisMessage";

import { AnalysisMessageList } from "./AnalysisMessageList";

afterEach(cleanup);

const customMessages: AnalysisMessage[] = [
  {
    analysisTaskId: "analysis-task-user",
    content: "用户消息只表示本次问题，不作为右侧分析详情入口。",
    completedAt: "2026-06-09T09:59:00+08:00",
    conversationId: "conversation-custom",
    createdAt: "2026-06-09T09:58:00+08:00",
    messageId: "message-user-only",
    reportId: null,
    role: "user",
    runId: "analysis-custom",
    sourceEvidenceIds: [],
    status: "completed",
    toolCallIds: [],
    turnId: "turn-conversation-custom-0"
  },
  {
    content: "只渲染传入的 assistant 消息。",
    completedAt: "2026-06-09T10:00:10+08:00",
    conversationId: "conversation-custom",
    createdAt: "2026-06-09T10:00:00+08:00",
    messageId: "message-assistant-only",
    reportId: null,
    role: "assistant",
    analysisTaskId: "analysis-task-custom",
    runId: "analysis-custom",
    sourceEvidenceIds: [],
    status: "completed",
    toolCallIds: [],
    turnId: "turn-conversation-custom-1"
  }
];

describe("AnalysisMessageList", () => {
  it("renders from messages and only lets assistant messages drive the inspector anchor", () => {
    const onSelectMessageAnchor = vi.fn();

    render(
      <TestProviders>
        <AnalysisMessageList
          messages={customMessages}
          onSelectMessageAnchor={onSelectMessageAnchor}
          selectedMessageId={null}
        />
      </TestProviders>
    );

    const log = screen.getByRole("log", { name: "Analysis message list" });

    expect(log).toBeTruthy();
    expect(screen.getByText("Assistant")).toBeTruthy();
    expect(screen.getByText("User")).toBeTruthy();
    expect(screen.getByText("只渲染传入的 assistant 消息。")).toBeTruthy();
    expect(screen.getByText("用户消息只表示本次问题，不作为右侧分析详情入口。")).toBeTruthy();
    expect(screen.queryByText("System")).toBeNull();
    expect(screen.queryByRole("button", { name: /用户消息只表示本次问题/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /只渲染传入的 assistant 消息/ }));
    expect(onSelectMessageAnchor).toHaveBeenCalledWith("message-assistant-only");
    expect(onSelectMessageAnchor).toHaveBeenCalledTimes(1);
  });
});
