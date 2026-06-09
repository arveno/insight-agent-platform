import type { MessageRole, MessageStatus } from "./runtimeContractTypes";

export type AnalysisMessageRole = MessageRole;

export type AnalysisMessageStatus = MessageStatus;

export type AnalysisMessage = {
  content: string;
  completedAt: string | null;
  conversationId: string;
  createdAt: string;
  footerText?: string;
  messageId: string;
  metaText?: string;
  role: AnalysisMessageRole;
  reportId: string | null;
  runId: string | null;
  sourceEvidenceIds: string[];
  status: AnalysisMessageStatus;
  supportingItems?: string[];
  supportingTitle?: string;
  toolCallIds: string[];
  turnId: string;
};
