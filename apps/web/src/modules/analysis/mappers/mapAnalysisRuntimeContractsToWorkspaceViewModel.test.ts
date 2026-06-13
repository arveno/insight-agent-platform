import { describe, expect, it } from "vitest";

import type {
  AnalysisRun,
  AnalysisTask,
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
import goldenPathExample from "../../../../../../packages/contracts/examples/analysis-runtime/golden-path.json";

import { mapAnalysisRuntimeContractsToWorkspaceViewModel } from "./mapAnalysisRuntimeContractsToWorkspaceViewModel";

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

describe("mapAnalysisRuntimeContractsToWorkspaceViewModel", () => {
  it("maps runtime contracts into the analysis workspace view model with canonical ids", () => {
    const goldenPath = goldenPathExample as GoldenPathExample;

    const workspaceViewModel = mapAnalysisRuntimeContractsToWorkspaceViewModel({
      analysisTask: goldenPath.analysisTask,
      conversation: goldenPath.conversation,
      currentRun: goldenPath.analysisRun,
      decisions: goldenPath.decisions,
      messageStream: goldenPath.messageStream,
      messages: goldenPath.messages,
      modelCalls: goldenPath.modelCalls,
      reports: goldenPath.reports,
      runEvents: goldenPath.runEvents,
      sourceEvidence: goldenPath.sourceEvidence,
      toolCalls: goldenPath.toolCalls
    });

    expect(workspaceViewModel.sessions).toHaveLength(1);

    const session = workspaceViewModel.sessions[0]!;
    const assistantContractMessage = goldenPath.messages.find(
      (message) => message.role === "assistant"
    );

    expect(session.conversationId).toBe(goldenPath.conversation.conversationId);
    expect(session.analysisTaskId).toBe(goldenPath.analysisTask.analysisTaskId);
    expect(session.analysisTaskContextPack?.root.title).toBe(
      goldenPath.analysisTask.contextPack?.root.title
    );
    expect(session.sessionSummary.conversationId).toBe(goldenPath.conversation.conversationId);
    expect(session.currentRun.runId).toBe(goldenPath.analysisRun.runId);
    expect(session.currentRun.status).toBe(goldenPath.analysisRun.status);
    expect(session.messages.map((message) => message.messageId)).toEqual(
      goldenPath.messages.map((message) => message.messageId)
    );
    expect(session.messages.map((message) => message.conversationId)).toEqual(
      goldenPath.messages.map((message) => message.conversationId)
    );
    expect(session.runEvents.map((event) => event.eventId)).toEqual(
      goldenPath.runEvents.map((event) => event.eventId)
    );
    expect(session.sourceEvidence.map((item) => item.sourceEvidenceId)).toEqual(
      goldenPath.sourceEvidence.map((item) => item.sourceEvidenceId)
    );
    expect(session.toolDetails.map((item) => item.toolCallId)).toEqual(
      goldenPath.toolCalls.map((item) => item.toolCallId)
    );
    expect(session.modelDetails.map((item) => item.modelCallId)).toEqual(
      goldenPath.modelCalls.map((item) => item.modelCallId)
    );
    expect(session.decisions.map((item) => item.decisionId)).toEqual(
      goldenPath.decisions.map((item) => item.decisionId)
    );
    expect(session.messageStream?.messageId).toBe(goldenPath.messageStream.at(-1)?.messageId);
    expect(session.messageStream?.status).toBe(goldenPath.messageStream.at(-1)?.status);
    expect(session.messages.find((message) => message.role === "assistant")?.content).toBe(
      assistantContractMessage?.content
    );
    expect(session.messages.find((message) => message.role === "assistant")?.analysisTaskId).toBe(
      goldenPath.analysisTask.analysisTaskId
    );
    expect(session.reportPreview?.reportId).toBe(goldenPath.reports[0]?.reportId ?? null);
  });

  it("keeps the run lifecycle independent from message stream completion", () => {
    const goldenPath = goldenPathExample as GoldenPathExample;

    const workspaceViewModel = mapAnalysisRuntimeContractsToWorkspaceViewModel({
      analysisTask: goldenPath.analysisTask,
      conversation: goldenPath.conversation,
      currentRun: {
        ...goldenPath.analysisRun,
        completedAt: null,
        outcome: null,
        status: "running"
      },
      decisions: goldenPath.decisions,
      messageStream: goldenPath.messageStream,
      messages: goldenPath.messages,
      modelCalls: goldenPath.modelCalls,
      reports: goldenPath.reports,
      runEvents: goldenPath.runEvents,
      sourceEvidence: goldenPath.sourceEvidence,
      toolCalls: goldenPath.toolCalls
    });

    expect(
      goldenPath.messageStream.some((streamEvent) => streamEvent.eventType === "stream.completed")
    ).toBe(true);
    expect(workspaceViewModel.sessions[0]?.currentRun.status).toBe("running");
  });
});
