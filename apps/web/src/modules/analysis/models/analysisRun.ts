import type {
  SharedRiskViewModel,
  SharedStatusViewModel
} from "../../../shared/utils/viewModelState";
import type {
  AnalysisRunEventStatus,
  AnalysisRunEventType,
  AnalysisRunStatus
} from "./runtimeContractTypes";

export type { AnalysisRunEventStatus, AnalysisRunEventType, AnalysisRunStatus };

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
