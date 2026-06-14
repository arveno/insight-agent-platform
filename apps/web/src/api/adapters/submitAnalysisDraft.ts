import type {
  AnalysisTaskContextPack,
  SubmitAnalysisDraftResponse
} from "../../modules/analysis/models/runtimeContractTypes";
import type { AnalysisContextRouteState } from "../../shared/navigation/navigationTypes";
import { AgentRuntimeClient } from "../client/agentRuntimeClient";

export type SubmitAnalysisDraftInput = {
  businessDomainId: string;
  conversationId?: string | null;
  draftContext?: AnalysisContextRouteState;
  question: string;
};

export async function submitAnalysisDraft(
  input: SubmitAnalysisDraftInput,
  client = new AgentRuntimeClient()
): Promise<SubmitAnalysisDraftResponse> {
  return client.submitAnalysisDraft({
    ...(input.conversationId ? { conversationId: input.conversationId } : {}),
    businessDomainId: input.businessDomainId,
    contextPack: (input.draftContext as AnalysisTaskContextPack | undefined) ?? null,
    question: input.question
  });
}
