import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type {
  AnalysisRun,
  AnalysisTask,
  AnalysisTaskContextPack,
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
  analysisTask: AnalysisTask;
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

function createDraftContext(): AnalysisTaskContextPack {
  return {
    capturedAt: "2026-06-12T10:28:00+08:00",
    root: {
      nodeId: "draft-context-root",
      kind: "report",
      role: "inputContext",
      owner: {
        type: "analysisTask"
      },
      title: "周经营分析报告",
      summary: "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。",
      chips: ["Northstar Retail China", "Last 7 days", "3 条证据"],
      sourceRef: {
        reportId: "report-weekly-operations-review",
        type: "report"
      }
    },
    suggestedPrompt: "请继续分析华东收入增速放缓的主要原因。",
    traceability: "direct_refs",
    version: 1
  };
}

function installRuntimeFetchMock(goldenPath: GoldenPathExample) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.endsWith(`/conversations/${goldenPath.conversation.conversationId}`)) {
      return Response.json(goldenPath.conversation);
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}`)) {
      return Response.json(goldenPath.analysisRun);
    }

    if (url.endsWith(`/analysis-tasks/${goldenPath.analysisTask.analysisTaskId}`)) {
      return Response.json(goldenPath.analysisTask);
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
    expect(screen.getByRole("textbox", { name: "输入你想分析的问题" })).toBeTruthy();
    expect(within(main).getByText("输入问题开始分析")).toBeTruthy();
    expect(within(main).queryByText("当前没有一次性上下文")).toBeNull();
    expect(within(main).queryByText("Context Draft")).toBeNull();
    expect(within(main).queryByText("新聊天草稿")).toBeNull();
    expect(screen.queryByText("No analysis runtime selected")).toBeNull();
  });

  it("hydrates tree-shaped analysis context into the draft composer and draft strip", () => {
    const draftContext = createDraftContext();

    render(
      <TestProviders>
        <AnalysisPage
          routeState={{
            analysisContextPack: draftContext
          }}
        />
      </TestProviders>
    );

    const main = screen.getByRole("region", { name: "Analysis conversation" });

    expect(within(main).queryByText(draftContext.root.title)).toBeNull();
    expect(within(main).queryByText(draftContext.root.summary ?? "")).toBeNull();
    expect(screen.queryByText(/^Context$/)).toBeNull();
    expect(within(main).queryByText("已附带上下文，详情见右侧分析详情。")).toBeNull();
    expect(within(main).getByText("输入问题开始分析")).toBeTruthy();
    expect((screen.getByRole("textbox", { name: "输入你想分析的问题" }) as HTMLTextAreaElement).value).toBe(
      draftContext.suggestedPrompt
    );
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

    expect(within(main).getByRole("log", { name: "Analysis message list" })).toBeTruthy();
    expect(within(main).getByText("System")).toBeTruthy();
    expect(within(main).getByText("User")).toBeTruthy();
    expect(within(main).getByText("Assistant")).toBeTruthy();
    expect(within(main).queryByText(/收入增速异常 · completed · 更新于/)).toBeNull();
    expect(within(main).queryByText("相关证据")).toBeNull();
    expect(within(main).queryByText("相关工具")).toBeNull();
    expect(within(main).getByText(/Stream completed · 更新于/)).toBeTruthy();
    expect(within(main).getByRole("button", { name: "打开聊天工具入口" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "选择模型" })).toBeTruthy();
    expect(within(main).queryByText("分析任务")).toBeNull();
    expect(within(main).queryByText("后续追问")).toBeNull();
    expect(within(main).getByRole("button", { name: "发送" })).toBeTruthy();
    expect(within(main).queryByText("Message Stream Replay")).toBeNull();
    expect(within(main).queryByText("结果摘要")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "选择模型" }));
    fireEvent.click(await screen.findByText("Reasoning"));
    expect(screen.getByRole("button", { name: "选择模型" }).textContent).toContain("Reasoning");

    fireEvent.change(screen.getByRole("textbox", { name: "输入你想分析的问题" }), {
      target: { value: "继续追问华东渠道和最近 7 天的差异。" }
    });
    expect(
      within(screen.getByRole("log", { name: "Analysis message list" })).queryByText(
        "继续追问华东渠道和最近 7 天的差异。"
      )
    ).toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(11);
  });

  it("submits a tree-shaped context pack through POST /analysis-tasks/submit and switches into the runtime conversation", async () => {
    const draftContext = createDraftContext();
    const submitPayload = {
      analysisRun: {
        analysisTaskId: "analysis-task-201-submit",
        cancelRequestedAt: null,
        cancelledAt: null,
        cancellingAt: null,
        completedAt: null,
        createdAt: "2026-06-12T10:30:00+08:00",
        expiredAt: null,
        failedAt: null,
        failureCode: null,
        originalRunId: null,
        outcome: null,
        phase: "intake",
        queuedAt: null,
        rejectedAt: null,
        retryOfRunId: null,
        retryable: true,
        runId: "analysis-run-201-submit",
        startedAt: null,
        status: "created",
        terminalReason: null,
        timeoutAt: null,
        userId: "user-zoe",
        validatingAt: null,
        waitingFor: null,
        waitingSince: null,
        workspaceId: "workspace-northstar-retail-china"
      },
      analysisTask: {
        analysisTaskId: "analysis-task-201-submit",
        businessDomainId: "business-domain-revenue-quality",
        contextPack: {
          ...draftContext,
          root: {
            ...draftContext.root,
            owner: {
              analysisTaskId: "analysis-task-201-submit",
              type: "analysisTask"
            }
          }
        },
        conversationId: "conversation-201-submit",
        createdAt: "2026-06-12T10:30:00+08:00",
        question: "解释华东区域收入增速放缓的主要原因，并给出下一步建议。",
        updatedAt: "2026-06-12T10:30:00+08:00",
        userId: "user-zoe",
        workspaceId: "workspace-northstar-retail-china"
      },
      conversation: {
        conversationId: "conversation-201-submit",
        createdAt: "2026-06-12T10:30:00+08:00",
        currentRunId: "analysis-run-201-submit",
        status: "active",
        title: "解释华东区域收入增速放缓的主要原因",
        updatedAt: "2026-06-12T10:30:00+08:00",
        userId: "user-zoe",
        workspaceId: "workspace-northstar-retail-china"
      },
      userMessage: {
        analysisTaskId: "analysis-task-201-submit",
        completedAt: "2026-06-12T10:30:00+08:00",
        content: "解释华东区域收入增速放缓的主要原因，并给出下一步建议。",
        conversationId: "conversation-201-submit",
        createdAt: "2026-06-12T10:30:00+08:00",
        messageId: "message-201-submit",
        reportId: null,
        role: "user",
        runId: "analysis-run-201-submit",
        sourceEvidenceIds: [],
        status: "completed",
        toolCallIds: [],
        turnId: "turn-201-submit"
      }
    };
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/analysis-tasks/submit")) {
        return Response.json(submitPayload);
      }

      if (url.endsWith("/conversations/conversation-201-submit")) {
        return Response.json(submitPayload.conversation);
      }

      if (url.endsWith("/analysis-runs/analysis-run-201-submit")) {
        return Response.json(submitPayload.analysisRun);
      }

      if (url.endsWith("/analysis-tasks/analysis-task-201-submit")) {
        return Response.json(submitPayload.analysisTask);
      }

      if (url.endsWith("/conversations/conversation-201-submit/messages")) {
        return Response.json({ items: [submitPayload.userMessage] });
      }

      if (url.endsWith("/analysis-runs/analysis-run-201-submit/events")) {
        return Response.json({
          items: [
            {
              actor: "analysis_runtime_stub",
              agentName: "analysis-agent",
              completedAt: "2026-06-12T10:30:00+08:00",
              errorCode: null,
              errorMessage: null,
              eventId: "event-201-submit",
              eventType: "run.created",
              nodeName: "run.created",
              occurredAt: "2026-06-12T10:30:00+08:00",
              parentEventId: null,
              phase: "intake",
              refId: null,
              refType: null,
              runId: "analysis-run-201-submit",
              sequence: 0,
              startedAt: "2026-06-12T10:30:00+08:00",
              status: "succeeded",
              summary: "记录 AnalysisRun 已创建并绑定 AnalysisTask / Conversation。",
              toolName: null
            }
          ]
        });
      }

      if (
        url.endsWith("/analysis-runs/analysis-run-201-submit/tool-calls") ||
        url.endsWith("/analysis-runs/analysis-run-201-submit/model-calls") ||
        url.endsWith("/analysis-runs/analysis-run-201-submit/source-evidence") ||
        url.endsWith("/analysis-runs/analysis-run-201-submit/reports") ||
        url.endsWith("/analysis-runs/analysis-run-201-submit/decisions")
      ) {
        return Response.json({ items: [] });
      }

      throw new Error(`Unhandled request: ${url} ${init?.method ?? "GET"}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <TestProviders>
        <AnalysisPage
          routeState={{
            analysisContextPack: draftContext
          }}
          submitIdentity={{
            businessDomainId: "business-domain-revenue-quality",
            userId: "user-zoe",
            workspaceId: "workspace-northstar-retail-china"
          }}
        />
      </TestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "发送" }));

    expect(await screen.findByRole("log", { name: "Analysis message list" })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/analysis-tasks/submit", {
      body: JSON.stringify({
        businessDomainId: "business-domain-revenue-quality",
        contextPack: draftContext,
        question: draftContext.suggestedPrompt,
        userId: "user-zoe",
        workspaceId: "workspace-northstar-retail-china"
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    expect(screen.getByText("User")).toBeTruthy();
    expect(screen.getByText("解释华东区域收入增速放缓的主要原因，并给出下一步建议。")).toBeTruthy();
    expect(screen.queryByText("Assistant")).toBeNull();
    expect(screen.queryByText(/write path 暂未实现/)).toBeNull();
    expect(screen.queryByText("结果摘要")).toBeNull();
  });
});
