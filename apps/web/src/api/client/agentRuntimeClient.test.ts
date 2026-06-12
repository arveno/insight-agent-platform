import { afterEach, describe, expect, it, vi } from "vitest";

import { AgentRuntimeClient, RuntimeApiError } from "./agentRuntimeClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AgentRuntimeClient", () => {
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

    await expect(
      client.streamMessageStream("conversation-123", "message-456")
    ).rejects.toMatchObject<Partial<RuntimeApiError>>({
      code: "STREAM_UNAVAILABLE",
      message: "SSE stream unavailable.",
      name: "RuntimeApiError",
      status: 503
    });
  });
});
