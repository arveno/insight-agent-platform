import type { MessageRole } from "./runtimeContractTypes";

export type InspectorSubject =
  | {
      type: "analysisTask";
      analysisTaskId: string;
      runId?: string;
    }
  | {
      type: "analysisRun";
      runId: string;
      analysisTaskId: string;
    }
  | {
      type: "message";
      messageId: string;
      conversationId: string;
      analysisTaskId?: string;
      runId?: string;
      role: MessageRole;
    };
