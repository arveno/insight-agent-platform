import type { DraftContextPack } from "../../shared/navigation/navigationTypes";
import type {
  AnalysisTaskContextPack,
  SubmitAnalysisDraftResponse
} from "../../modules/analysis/models/runtimeContractTypes";
import { AgentRuntimeClient } from "../client/agentRuntimeClient";

export type SubmitAnalysisDraftInput = {
  businessDomainId: string;
  conversationId?: string | null;
  draftContext?: DraftContextPack;
  question: string;
  userId: string;
  workspaceId: string;
};

function mapDraftContextToContract(
  draftContext?: DraftContextPack
): AnalysisTaskContextPack | null {
  if (!draftContext) {
    return null;
  }

  return {
    chips: draftContext.chips,
    sourceId: draftContext.sourceId,
    sourceTitle: draftContext.sourceTitle,
    sourceType: draftContext.sourceType,
    suggestedPrompt: draftContext.suggestedPrompt,
    summary: draftContext.summary
  };
}

export async function submitAnalysisDraft(
  input: SubmitAnalysisDraftInput,
  client = new AgentRuntimeClient()
): Promise<SubmitAnalysisDraftResponse> {
  return client.submitAnalysisDraft({
    ...(input.conversationId ? { conversationId: input.conversationId } : {}),
    businessDomainId: input.businessDomainId,
    contextPack: mapDraftContextToContract(input.draftContext),
    question: input.question,
    userId: input.userId,
    workspaceId: input.workspaceId
  });
}
