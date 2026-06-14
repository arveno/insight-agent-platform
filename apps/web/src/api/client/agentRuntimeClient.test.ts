import { afterEach, describe, expect, it, vi } from "vitest";

import { AgentRuntimeClient, RuntimeApiError } from "./agentRuntimeClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AgentRuntimeClient", () => {
  it("lists workspace-scoped shared metrics from the authenticated runtime API", async () => {
    const metricsPayload = {
      items: [
        {
          businessDomainId: "business-domain-revenue-quality",
          contextSources: [],
          createdAt: "2026-06-12T10:30:00+08:00",
          currentValue: "¥12.8M",
          description: "已满足确认条件的收入金额。",
          formulaSummary: "确认收入 = 已预订收入 - 退款金额",
          metricId: "metric-recognized-revenue",
          name: "确认收入",
          ownerTeam: "Revenue Operations",
          period: "Last 30 days",
          riskLevel: "medium",
          status: "attention",
          thresholdSummary: "收入增速 < -2% 进入关注",
          trendDirection: "down",
          trendValue: "-3.2%",
          unit: "CNY",
          updatedAt: "2026-06-12T10:30:00+08:00",
          workspaceId: "workspace-northstar-retail-china"
        }
      ]
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(metricsPayload));
    vi.stubGlobal("fetch", fetchMock);
    const client = new AgentRuntimeClient("http://runtime.test");

    const result = await client.listMetrics();

    expect(result).toEqual(metricsPayload);
    expect(fetchMock).toHaveBeenCalledWith("http://runtime.test/metrics", {
      headers: {
        Accept: "application/json"
      },
      method: "GET",
      credentials: "include"
    });
  });

  it("reads one workspace-scoped metric detail by canonical metricId", async () => {
    const metric = {
      businessDomainId: "business-domain-revenue-quality",
      contextSources: [
        {
          createdAt: "2026-06-12T10:30:00+08:00",
          metricContextSourceId: "metric-context-source-revenue-table",
          metricId: "metric-recognized-revenue",
          role: "primary_table",
          sourceId: "table-sales-order",
          sourceType: "dataTable",
          summary: "作为确认收入的主表来源。",
          title: "销售订单汇总表",
          updatedAt: "2026-06-12T10:30:00+08:00"
        }
      ],
      createdAt: "2026-06-12T10:30:00+08:00",
      currentValue: "¥12.8M",
      description: "已满足确认条件的收入金额。",
      formulaSummary: "确认收入 = 已预订收入 - 退款金额",
      metricId: "metric-recognized-revenue",
      name: "确认收入",
      ownerTeam: "Revenue Operations",
      period: "Last 30 days",
      riskLevel: "medium",
      status: "attention",
      thresholdSummary: "收入增速 < -2% 进入关注",
      trendDirection: "down",
      trendValue: "-3.2%",
      unit: "CNY",
      updatedAt: "2026-06-12T10:30:00+08:00",
      workspaceId: "workspace-northstar-retail-china"
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(metric));
    vi.stubGlobal("fetch", fetchMock);
    const client = new AgentRuntimeClient("http://runtime.test");

    const result = await client.getMetric("metric-recognized-revenue");

    expect(result).toEqual(metric);
    expect(fetchMock).toHaveBeenCalledWith("http://runtime.test/metrics/metric-recognized-revenue", {
      headers: {
        Accept: "application/json"
      },
      method: "GET",
      credentials: "include"
    });
  });

  it("reads the persisted analysis task surface by canonical analysisTaskId", async () => {
    const analysisTask = {
      analysisTaskId: "analysis-task-123",
      businessDomainId: "business-domain-revenue-quality",
      contextPack: null,
      conversationId: "conversation-123",
      createdAt: "2026-06-12T10:30:00+08:00",
      question: "解释华东区域收入增速放缓的主要原因。",
      updatedAt: "2026-06-12T10:30:00+08:00",
      userId: "user-zoe",
      workspaceId: "workspace-northstar-retail-china"
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(analysisTask));
    vi.stubGlobal("fetch", fetchMock);
    const client = new AgentRuntimeClient("http://runtime.test");

    const result = await client.getAnalysisTask("analysis-task-123");

    expect(result).toEqual(analysisTask);
    expect(fetchMock).toHaveBeenCalledWith("http://runtime.test/analysis-tasks/analysis-task-123", {
      headers: {
        Accept: "application/json"
      },
      method: "GET",
      credentials: "include"
    });
  });

  it("submits the canonical draft endpoint and returns the persisted submit chain", async () => {
    const persistedSubmitChain = {
      analysisRun: { runId: "analysis-run-123" },
      analysisTask: { analysisTaskId: "analysis-task-123" },
      conversation: { conversationId: "conversation-123", currentRunId: "analysis-run-123" },
      userMessage: { messageId: "message-123" }
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(persistedSubmitChain));
    vi.stubGlobal("fetch", fetchMock);
    const client = new AgentRuntimeClient("http://runtime.test") as AgentRuntimeClient & {
      submitAnalysisDraft: (payload: Record<string, unknown>) => Promise<unknown>;
    };

    const result = await client.submitAnalysisDraft({
      businessDomainId: "business-domain-revenue-quality",
      contextPack: null,
      question: "解释华东区域收入增速放缓的主要原因。"
    });

    expect(result).toEqual(persistedSubmitChain);
    expect(fetchMock).toHaveBeenCalledWith("http://runtime.test/analysis-tasks/submit", {
      body: JSON.stringify({
        businessDomainId: "business-domain-revenue-quality",
        contextPack: null,
        question: "解释华东区域收入增速放缓的主要原因。"
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      credentials: "include"
    });
  });

  it("throws RuntimeApiError when the canonical draft submit endpoint fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        {
          errorCode: "MISMATCH",
          message: "Conversation.workspaceId does not match request.workspaceId"
        },
        { status: 409 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = new AgentRuntimeClient("http://runtime.test") as AgentRuntimeClient & {
      submitAnalysisDraft: (payload: Record<string, unknown>) => Promise<unknown>;
    };

    await expect(
      client.submitAnalysisDraft({
        businessDomainId: "business-domain-revenue-quality",
        contextPack: null,
        conversationId: "conversation-123",
        question: "继续追问华东收入增速放缓的主要原因。"
      })
    ).rejects.toMatchObject({
      code: "MISMATCH",
      message: "Conversation.workspaceId does not match request.workspaceId",
      name: "RuntimeApiError",
      status: 409
    });
  });

  it("requests the MessageStream SSE live path with Accept: text/event-stream and returns the raw response", async () => {
    const jsonSpy = vi.fn();
    const response = {
      json: jsonSpy,
      ok: true,
      status: 200
    } as unknown as Response;
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    const client = new AgentRuntimeClient("http://runtime.test");

    const result = await client.streamMessageStream("conversation-123", "message-456");

    expect(result).toBe(response);
    expect(jsonSpy).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://runtime.test/conversations/conversation-123/messages/message-456/stream",
      {
        headers: {
          Accept: "text/event-stream"
        },
        method: "GET",
        credentials: "include"
      }
    );
  });

  it("throws RuntimeApiError when the MessageStream SSE live path request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        {
          errorCode: "STREAM_UNAVAILABLE",
          message: "SSE stream unavailable."
        },
        { status: 503 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = new AgentRuntimeClient("http://runtime.test");
    const expectedError: Partial<RuntimeApiError> = {
      code: "STREAM_UNAVAILABLE",
      message: "SSE stream unavailable.",
      name: "RuntimeApiError",
      status: 503
    };

    await expect(
      client.streamMessageStream("conversation-123", "message-456")
    ).rejects.toMatchObject(expectedError);
  });
});
