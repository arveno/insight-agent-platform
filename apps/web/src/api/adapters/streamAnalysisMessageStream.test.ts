import { waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MessageStreamContract } from "../../modules/analysis/models/runtimeContractTypes";
import { subscribeToAnalysisMessageStream } from "./streamAnalysisMessageStream";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function createSseResponse(frames: string): Response {
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(frames));
        controller.close();
      }
    }),
    {
      headers: {
        "Content-Type": "text/event-stream"
      }
    }
  );
}

function createStreamEvent(
  sequence: number,
  eventType: MessageStreamContract["eventType"],
  delta: string,
  status: MessageStreamContract["status"]
): MessageStreamContract {
  return {
    conversationId: "conversation-123",
    delta,
    errorCode: null,
    errorMessage: null,
    eventType,
    messageId: "message-456",
    messageStreamId: `message-stream-123-${sequence}`,
    occurredAt: "2026-06-12T10:31:00+08:00",
    runId: "analysis-run-123",
    sequence,
    status
  };
}

function toSseFrame(event: MessageStreamContract): string {
  return `id: ${event.sequence}\nevent: ${event.eventType}\ndata: ${JSON.stringify(event)}\n\n`;
}

describe("subscribeToAnalysisMessageStream", () => {
  it("parses SSE data and reconnects once with Last-Event-ID", async () => {
    vi.stubEnv("VITE_AGENT_RUNTIME_BASE_URL", "http://runtime.test");
    const events: MessageStreamContract[] = [];
    const started = createStreamEvent(0, "stream.started", "", "created");
    const delta = createStreamEvent(1, "stream.delta", "收入增速放缓", "streaming");
    const completed = createStreamEvent(2, "stream.completed", "来自确认延迟。", "completed");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createSseResponse(`${toSseFrame(started)}data: {}\n\n${toSseFrame(delta)}`)
      )
      .mockResolvedValueOnce(createSseResponse(toSseFrame(completed)));
    vi.stubGlobal("fetch", fetchMock);

    const unsubscribe = subscribeToAnalysisMessageStream({
      conversationId: "conversation-123",
      messageId: "message-456",
      onError: vi.fn(),
      onEvent: (event) => events.push(event)
    });

    await waitFor(() => {
      expect(events.map((event) => event.sequence)).toEqual([0, 1, 2]);
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://runtime.test/conversations/conversation-123/messages/message-456/stream",
      expect.objectContaining({
        headers: {
          Accept: "text/event-stream",
          "Last-Event-ID": "1"
        }
      })
    );

    unsubscribe();
  });
});
