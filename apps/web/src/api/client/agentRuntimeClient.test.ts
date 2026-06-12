import { afterEach, describe, expect, it, vi } from "vitest";

import { AgentRuntimeClient, RuntimeApiError } from "./agentRuntimeClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AgentRuntimeClient", () => {
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
      question: "解释华东区域收入增速放缓的主要原因。",
      userId: "user-zoe",
      workspaceId: "workspace-northstar-retail-china"
    });

    expect(result).toEqual(persistedSubmitChain);
    expect(fetchMock).toHaveBeenCalledWith("http://runtime.test/analysis-tasks/submit", {
      body: JSON.stringify({
        businessDomainId: "business-domain-revenue-quality",
        contextPack: null,
        question: "解释华东区域收入增速放缓的主要原因。",
        userId: "user-zoe",
        workspaceId: "workspace-northstar-retail-china"
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST"
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
        question: "继续追问华东收入增速放缓的主要原因。",
        userId: "user-luca",
        workspaceId: "workspace-other"
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
        method: "GET"
      }
    );
  });

  it("throws RuntimeApiError when the MessageStream SSE live path request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        {
          error: {
            code: "STREAM_UNAVAILABLE",
            message: "SSE stream unavailable."
          }
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
