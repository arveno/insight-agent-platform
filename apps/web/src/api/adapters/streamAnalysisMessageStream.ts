import type { MessageStreamContract } from "../../modules/analysis/models/runtimeContractTypes";
import { AgentRuntimeClient } from "../client/agentRuntimeClient";

export type AnalysisMessageStreamSubscriber = (input: {
  conversationId: string;
  messageId: string;
  onEvent: (event: MessageStreamContract) => void;
  onError: () => void;
}) => () => void;

function parseSseData(buffer: string): { data: string[]; rest: string } {
  const chunks = buffer.split(/\r?\n\r?\n/);
  const rest = chunks.pop() ?? "";

  return {
    data: chunks.flatMap((chunk) =>
      chunk
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice("data:".length).trim())
        .filter((line) => line.length > 0)
    ),
    rest
  };
}

export const subscribeToAnalysisMessageStream: AnalysisMessageStreamSubscriber = ({
  conversationId,
  messageId,
  onError,
  onEvent
}) => {
  const abortController = new AbortController();
  const decoder = new TextDecoder();
  const client = new AgentRuntimeClient();
  let lastEventId: string | undefined;
  let reconnectCount = 0;

  async function readStream(): Promise<boolean> {
    let terminalEventSeen = false;

    const response = await client.streamMessageStream(
      conversationId,
      messageId,
      abortController.signal,
      lastEventId
    );
    const reader = response.body?.getReader();

    if (!reader) {
      return true;
    }

    let buffer = "";

    while (!abortController.signal.aborted) {
      const { done, value } = await reader.read();

      if (done) {
        return terminalEventSeen;
      }

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseData(buffer);
      buffer = parsed.rest;

      for (const item of parsed.data) {
        if (item === "{}") {
          continue;
        }

        const event = JSON.parse(item) as MessageStreamContract;
        lastEventId = String(event.sequence);
        terminalEventSeen = ["stream.completed", "stream.failed", "stream.cancelled"].includes(
          event.eventType
        );
        onEvent(event);
      }
    }

    return true;
  }

  void (async () => {
    while (!abortController.signal.aborted) {
      let completed = false;

      try {
        completed = await readStream();
      } catch {
        completed = false;
      }

      if (completed) {
        return;
      }

      if (!lastEventId || reconnectCount >= 1) {
        onError();
        return;
      }

      reconnectCount += 1;
    }
  })();

  return () => {
    abortController.abort();
  };
};
