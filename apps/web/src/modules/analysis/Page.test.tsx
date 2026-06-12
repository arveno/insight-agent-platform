import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type {
  AnalysisRun,
  Conversation,
  Decision,
  Message,
  MessageStream,
  ModelCall,
  Report,
  RunEvent,
  SourceEvidence,
  ToolCall
} from "@insight-agent/contracts/generated/typescript";
import goldenPathExample from "../../../../../packages/contracts/examples/analysis-runtime/golden-path.json";

import { TestProviders } from "../../shared/test/TestProviders";
import { AnalysisPage } from "./Page";

type GoldenPathExample = {
  analysisRun: AnalysisRun;
  conversation: Conversation;
  decisions: Decision[];
  messageStream: MessageStream[];
  messages: Message[];
  modelCalls: ModelCall[];
  reports: Report[];
  runEvents: RunEvent[];
  sourceEvidence: SourceEvidence[];
  toolCalls: ToolCall[];
};

function installRuntimeFetchMock(goldenPath: GoldenPathExample) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.endsWith(`/conversations/${goldenPath.conversation.conversationId}`)) {
      return Response.json(goldenPath.conversation);
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}`)) {
      return Response.json(goldenPath.analysisRun);
    }

    if (url.endsWith(`/conversations/${goldenPath.conversation.conversationId}/messages`)) {
      return Response.json({ items: goldenPath.messages });
    }

    if (
      url.endsWith(
        `/conversations/${goldenPath.conversation.conversationId}/messages/${goldenPath.messages[2]!.messageId}/stream`
      )
    ) {
      return Response.json({ items: goldenPath.messageStream });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/events`)) {
      return Response.json({ items: goldenPath.runEvents });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/tool-calls`)) {
      return Response.json({ items: goldenPath.toolCalls });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/model-calls`)) {
      return Response.json({ items: goldenPath.modelCalls });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/source-evidence`)) {
      return Response.json({ items: goldenPath.sourceEvidence });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/reports`)) {
      return Response.json({ items: goldenPath.reports });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/decisions`)) {
      return Response.json({ items: goldenPath.decisions });
    }

    throw new Error(`Unhandled request: ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined
    })
  });
});

describe("AnalysisPage", () => {
  it("renders an honest empty state without page header actions when no runtime bootstrap id is available", () => {
    render(
      <TestProviders>
        <AnalysisPage />
      </TestProviders>
    );

    expect(screen.queryByRole("region", { name: "Analysis conversation" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "分析" })).toBeNull();
    expect(screen.queryByRole("button", { name: "查看报告" })).toBeNull();
    expect(screen.queryByRole("button", { name: "查看观测" })).toBeNull();
    expect(screen.getByText("No analysis runtime selected")).toBeTruthy();
    expect(
      screen.getByText(
        "当前没有 conversationId 或 runId。请从带上下文入口进入 Analysis，或通过 URL 提供 bootstrap id。"
      )
    ).toBeTruthy();
  });

  it("loads the runtime-backed conversation shell when a bootstrap conversationId is present", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;
    const fetchMock = installRuntimeFetchMock(goldenPath);
    window.history.replaceState(
      {},
      "",
      `/?conversationId=${encodeURIComponent(goldenPath.conversation.conversationId)}`
    );

    render(
      <TestProviders>
        <AnalysisPage />
      </TestProviders>
    );

    const main = await screen.findByRole("region", { name: "Analysis conversation" });

    expect(screen.queryByRole("heading", { name: "分析" })).toBeNull();
    expect(screen.queryByRole("button", { name: "查看报告" })).toBeNull();
    expect(screen.queryByRole("button", { name: "查看观测" })).toBeNull();
    expect(main.getAttribute("style")).toContain("height: 100%");
    expect(
      within(main).getAllByText("来自 Analysis conversation · 收入增速异常 · Current scope")
    ).toHaveLength(2);
    expect(within(main).getByRole("log", { name: "Analysis message list" })).toBeTruthy();
    expect(within(main).getByText("System")).toBeTruthy();
    expect(within(main).getByText("User")).toBeTruthy();
    expect(within(main).getByText("Assistant")).toBeTruthy();
    expect(within(main).getByText("Message Stream Replay")).toBeTruthy();
    expect(within(main).getByRole("button", { name: "打开聊天工具入口" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "选择模型" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "发送消息" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "Run Trace" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "Tool / Model" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "Evidence" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "Report" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "Decision" })).toBeTruthy();
    expect(within(main).queryByText("Feedback / Bad Case 入口")).toBeNull();
    expect(within(main).queryByText("报告生成入口")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "选择模型" }));
    fireEvent.click(await screen.findByText("Reasoning"));
    expect(screen.getByRole("button", { name: "选择模型" }).textContent).toContain("Reasoning");

    fireEvent.change(screen.getByRole("textbox", { name: "后续追问" }), {
      target: { value: "继续追问华东渠道和最近 7 天的差异。" }
    });
    expect(
      within(screen.getByRole("log", { name: "Analysis message list" })).queryByText(
        "继续追问华东渠道和最近 7 天的差异。"
      )
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "发送消息" }));

    expect(screen.getByRole("button", { name: "发送消息" })).toBeTruthy();
    expect(screen.getAllByText(/read surfaces；Analysis write path 暂未实现/)).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(10);
  });
});
