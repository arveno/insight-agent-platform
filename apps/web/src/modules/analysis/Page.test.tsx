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
  it("renders a new-chat draft mode instead of the old no-runtime empty state", () => {
    render(
      <TestProviders>
        <AnalysisPage />
      </TestProviders>
    );

    const main = screen.getByRole("region", { name: "Analysis conversation" });

    expect(screen.queryByRole("heading", { name: "分析" })).toBeNull();
    expect(screen.queryByRole("button", { name: "查看报告" })).toBeNull();
    expect(screen.queryByRole("button", { name: "查看观测" })).toBeNull();
    expect(within(main).getByText("Draft Context")).toBeTruthy();
    expect(within(main).getByText("新聊天草稿")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "新聊天草稿" })).toBeTruthy();
    expect(screen.queryByText("No analysis runtime selected")).toBeNull();
  });

  it("hydrates one-shot DraftContextPack into the draft composer and structured context strip", () => {
    render(
      <TestProviders>
        <AnalysisPage
          routeState={{
            draftContextPack: {
              chips: ["Northstar Retail China", "Last 7 days", "3 条证据"],
              sourceId: "report-weekly-operations-review",
              sourceTitle: "周经营分析报告",
              sourceType: "report",
              suggestedPrompt: "请继续分析华东收入增速放缓的主要原因。",
              summary: "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。"
            }
          }}
        />
      </TestProviders>
    );

    expect(screen.getByText("report · 周经营分析报告")).toBeTruthy();
    expect(screen.getByText("sourceId: report-weekly-operations-review")).toBeTruthy();
    expect(screen.getByText("Northstar Retail China")).toBeTruthy();
    expect(
      (
        screen.getByRole("textbox", { name: "新聊天草稿" }) as HTMLTextAreaElement
      ).value
    ).toBe("请继续分析华东收入增速放缓的主要原因。");
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
