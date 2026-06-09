import type { SharedRiskViewModel, SharedStatusViewModel } from "../../../shared/utils/viewModelState";

export type AnalysisRunStatus =
  | "created"
  | "validating"
  | "rejected"
  | "queued"
  | "running"
  | "waiting"
  | "cancelling"
  | "cancelled"
  | "failed"
  | "completed"
  | "expired";

export type AnalysisRunEventStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped"
  | "cancelled";

export type AnalysisRunEventType =
  | "user_input"
  | "context_bound"
  | "plan_created"
  | "permission_check"
  | "model_call"
  | "tool_call"
  | "evidence_retrieval"
  | "summary_generated"
  | "feedback_waiting"
  | "report_draft_created"
  | "error"
  | "cancelled";

export type AnalysisRunEvent = {
  costText?: string;
  detail: string;
  durationText?: string;
  errorType?: string;
  eventId: string;
  eventType: AnalysisRunEventType;
  evidenceRefs?: string[];
  inputSummary?: string;
  modelName?: string;
  outputSummary?: string;
  riskViewModel?: SharedRiskViewModel;
  runId: string;
  status: AnalysisRunEventStatus;
  statusViewModel: SharedStatusViewModel;
  summary: string;
  timestampText?: string;
  title: string;
  tokenUsageText?: string;
  toolName?: string;
};

export type AnalysisRun = {
  costText: string;
  errorSummaryText: string;
  riskViewModel?: SharedRiskViewModel;
  runId: string;
  stageSummary: string;
  status: AnalysisRunStatus;
  statusViewModel: SharedStatusViewModel;
  tokenUsageText: string;
  totalDurationText: string;
  updatedAtText: string;
};
