export type AnalysisMessageRole = "system" | "user" | "assistant";

export type AnalysisMessageStatus = "completed" | "failed" | "streaming" | "cancelled";

export type AnalysisMessage = {
  content: string;
  createdAt: string;
  clientMessageId?: string;
  footerText?: string;
  messageId: string;
  metaText?: string;
  role: AnalysisMessageRole;
  runId?: string;
  sessionId: string;
  sourceRefs?: string[];
  status: AnalysisMessageStatus;
  supportingItems?: string[];
  supportingTitle?: string;
  toolRefs?: string[];
};
