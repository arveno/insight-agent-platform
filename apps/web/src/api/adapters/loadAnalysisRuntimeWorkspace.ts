import { AgentRuntimeClient, RuntimeApiError } from "../client/agentRuntimeClient";
import { mapAnalysisRuntimeContractsToWorkspaceViewModel } from "../../modules/analysis/mappers/mapAnalysisRuntimeContractsToWorkspaceViewModel";
import type { AnalysisWorkspaceViewModel, AnalysisSurfaceState } from "../../modules/analysis/models/analysisViewModel";

export type AnalysisRuntimeBootstrap = {
  conversationId?: string | null;
  runId?: string | null;
};

export type AnalysisWorkspaceLoadResult =
  | {
      description: string;
      kind: "empty";
      title: string;
    }
  | {
      description: string;
      kind: "error";
      title: string;
    }
  | {
      kind: "ready";
      viewModel: AnalysisWorkspaceViewModel;
    };

type SurfaceResult<T> = {
  items: T[];
  state: AnalysisSurfaceState;
};

function isMissingBootstrap(bootstrap: AnalysisRuntimeBootstrap): boolean {
  return !bootstrap.conversationId && !bootstrap.runId;
}

async function loadSurface<T>(fetcher: () => Promise<{ items: T[] }>): Promise<SurfaceResult<T>> {
  try {
    const response = await fetcher();

    return {
      items: response.items,
      state: response.items.length > 0 ? "ready" : "empty"
    };
  } catch (error) {
    if (error instanceof RuntimeApiError && error.status === 501) {
      return { items: [], state: "notImplemented" };
    }

    return { items: [], state: "unavailable" };
  }
}

export async function loadAnalysisRuntimeWorkspace(
  bootstrap: AnalysisRuntimeBootstrap,
  client = new AgentRuntimeClient()
): Promise<AnalysisWorkspaceLoadResult> {
  if (isMissingBootstrap(bootstrap)) {
    return {
      description:
        "当前没有可读取的 conversationId 或 runId。请从带上下文入口进入 Analysis，或通过 URL 提供 bootstrap id。",
      kind: "empty",
      title: "No analysis runtime selected"
    };
  }

  try {
    const conversation = bootstrap.conversationId
      ? await client.getConversation(bootstrap.conversationId)
      : await client.getRunConversation(bootstrap.runId!);
    const runId = bootstrap.runId ?? conversation.currentRunId;

    if (!runId) {
      return {
        description: "当前会话尚未绑定 AnalysisRun，无法加载 runtime delivery 内容。",
        kind: "empty",
        title: "Conversation has no current run"
      };
    }

    const [currentRun, messageList] = await Promise.all([
      client.getAnalysisRun(runId),
      client.listConversationMessages(conversation.conversationId)
    ]);
    const analysisTask = await client.getAnalysisTask(currentRun.analysisTaskId);
    const latestAssistantMessage = messageList.items
      .filter((message) => message.role === "assistant")
      .at(-1);
    const [messageStream, runEvents, toolCalls, modelCalls, sourceEvidence, reports, decisions] =
      await Promise.all([
        latestAssistantMessage
          ? loadSurface(() =>
              client.listMessageStream(conversation.conversationId, latestAssistantMessage.messageId)
            )
          : Promise.resolve({ items: [], state: "empty" as const }),
        loadSurface(() => client.listRunEvents(runId)),
        loadSurface(() => client.listToolCalls(runId)),
        loadSurface(() => client.listModelCalls(runId)),
        loadSurface(() => client.listSourceEvidence(runId)),
        loadSurface(() => client.listReports(runId)),
        loadSurface(() => client.listDecisions(runId))
      ]);

    return {
      kind: "ready",
      viewModel: mapAnalysisRuntimeContractsToWorkspaceViewModel(
        {
          analysisTask,
          conversation,
          currentRun,
          decisions: decisions.items,
          messageStream: messageStream.items,
          messages: messageList.items,
          modelCalls: modelCalls.items,
          reports: reports.items,
          runEvents: runEvents.items,
          sourceEvidence: sourceEvidence.items,
          toolCalls: toolCalls.items
        },
        {
          surfaceStates: {
            decisions: decisions.state,
            messageStream: messageStream.state,
            modelDetails: modelCalls.state,
            reportPreview: reports.state,
            sourceEvidence: sourceEvidence.state,
            toolDetails: toolCalls.state
          }
        }
      )
    };
  } catch (error) {
    return {
      description:
        error instanceof Error
          ? error.message
          : "Analysis runtime read surfaces are temporarily unavailable.",
      kind: "error",
      title: "Failed to load analysis runtime"
    };
  }
}
