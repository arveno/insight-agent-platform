import { afterEach, describe, expect, it, vi } from "vitest";

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

import { loadAnalysisRuntimeWorkspace } from "./loadAnalysisRuntimeWorkspace";

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadAnalysisRuntimeWorkspace", () => {
  it("returns an honest empty state when no bootstrap ids are available", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await loadAnalysisRuntimeWorkspace({});

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.kind).toBe("empty");
  });

  it("loads the approved runtime read surfaces and maps them into the analysis workspace view model", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;
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

    const result = await loadAnalysisRuntimeWorkspace({
      conversationId: goldenPath.conversation.conversationId
    });

    expect(result.kind).toBe("ready");
    if (result.kind !== "ready") {
      return;
    }

    const session = result.viewModel.sessions[0]!;

    expect(session.conversationId).toBe(goldenPath.conversation.conversationId);
    expect(session.currentRun.runId).toBe(goldenPath.analysisRun.runId);
    expect(session.messageStream?.messageId).toBe(goldenPath.messageStream.at(-1)?.messageId);
    expect(session.toolDetails.map((item) => item.toolCallId)).toEqual(
      goldenPath.toolCalls.map((item) => item.toolCallId)
    );
    expect(session.modelDetails.map((item) => item.modelCallId)).toEqual(
      goldenPath.modelCalls.map((item) => item.modelCallId)
    );
    expect(session.sourceEvidence.map((item) => item.sourceEvidenceId)).toEqual(
      goldenPath.sourceEvidence.map((item) => item.sourceEvidenceId)
    );
    expect(session.reportPreview?.reportId).toBe(goldenPath.reports[0]?.reportId);
    expect(session.decisions.map((item) => item.decisionId)).toEqual(
      goldenPath.decisions.map((item) => item.decisionId)
    );
    expect(fetchMock).toHaveBeenCalledTimes(10);
  });
});
