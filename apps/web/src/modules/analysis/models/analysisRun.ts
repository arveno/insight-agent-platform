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
  | "run.created"
  | "run.validating"
  | "run.rejected"
  | "run.queued"
  | "run.started"
  | "run.waiting"
  | "run.cancel_requested"
  | "run.cancelling"
  | "run.cancelled"
  | "run.failed"
  | "run.completed"
  | "run.expired"
  | "validation.started"
  | "validation.passed"
  | "validation.rejected"
  | "policy.check_started"
  | "policy.decision_recorded"
  | "context.bound"
  | "plan.created"
  | "approval.requested"
  | "approval.granted"
  | "approval.denied"
  | "approval.expired"
  | "worker.lease_acquired"
  | "worker.heartbeat"
  | "worker.lease_released"
  | "execution_attempt.created"
  | "execution_attempt.lost"
  | "model_call.started"
  | "model_call.completed"
  | "model_call.failed"
  | "tool_call.requested"
  | "tool_call.policy_checked"
  | "tool_call.started"
  | "tool_call.completed"
  | "tool_call.failed"
  | "evidence.retrieved"
  | "evidence.bound"
  | "synthesis.started"
  | "verification.started"
  | "verification.passed"
  | "verification.failed"
  | "delivery.started"
  | "artifact.persisted"
  | "feedback.received"
  | "evaluation.started"
  | "evaluation.completed"
  | "error.recorded";

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
