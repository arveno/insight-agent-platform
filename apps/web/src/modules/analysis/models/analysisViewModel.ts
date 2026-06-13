import type {
  SharedRiskViewModel,
  SharedStatusViewModel
} from "../../../shared/utils/viewModelState";
import type { AnalysisTaskContextPack } from "./runtimeContractTypes";

import type { AnalysisMessage } from "./analysisMessage";
import type { AnalysisRun, AnalysisRunEvent } from "./analysisRun";

export type AnalysisComposerSuggestionViewModel = {
  key: string;
  label: string;
};

export type AnalysisComposerViewModel = {
  contextHint: string;
  helperText: string;
  initialDraft: string;
  key: string;
  placeholder: string;
  submitLabel: string;
  suggestions: AnalysisComposerSuggestionViewModel[];
  title: string;
};

export type AnalysisDraftContextViewModel = AnalysisTaskContextPack;

export type AnalysisSessionSummaryViewModel = {
  conversationId: string;
  contextLabel: string;
  riskViewModel?: SharedRiskViewModel;
  runLabel: string;
  statusViewModel: SharedStatusViewModel;
  summary: string;
  title: string;
  updatedAtText: string;
};

export type AnalysisSurfaceState = "ready" | "empty" | "notImplemented" | "unavailable";

export type AnalysisMessageStreamViewModel = {
  eventCount: number;
  messageId: string;
  replayText: string;
  runId: string;
  status: string;
  updatedAtText: string;
};

export type AnalysisToolDetailViewModel = {
  runId: string;
  statusViewModel: SharedStatusViewModel;
  summary: string;
  toolCallId: string;
  toolName: string;
};

export type AnalysisModelDetailViewModel = {
  costText: string;
  latencyText: string;
  modelCallId: string;
  modelId: string;
  provider: string;
  runId: string;
  statusViewModel: SharedStatusViewModel;
  tokenUsageText: string;
};

export type AnalysisSourceEvidenceViewModel = {
  confidenceText: string;
  runId: string;
  sourceEvidenceId: string;
  sourceType: string;
  summary: string;
  title: string;
};

export type AnalysisReportPreviewViewModel = {
  reportId: string;
  runId: string;
  sections: { key: string; title: string; content: string }[];
  sourceEvidenceIds: string[];
  summary: string;
  title: string;
};

export type AnalysisDecisionViewModel = {
  createdAtText: string;
  decisionId: string;
  reportId: string;
  runId: string;
  status: string;
  statusViewModel: SharedStatusViewModel;
  title: string;
};

export type AnalysisComposerMode = "analysis" | "follow_up";

export type AnalysisSessionViewModel = {
  analysisTaskContextPack: AnalysisTaskContextPack | null;
  analysisTaskId: string;
  conversationId: string;
  currentRun: AnalysisRun;
  decisions: AnalysisDecisionViewModel[];
  decisionsState: AnalysisSurfaceState;
  followUpComposer: AnalysisComposerViewModel;
  inputComposer: AnalysisComposerViewModel;
  messageStream?: AnalysisMessageStreamViewModel;
  messageStreamState: AnalysisSurfaceState;
  messages: AnalysisMessage[];
  modelDetails: AnalysisModelDetailViewModel[];
  modelDetailsState: AnalysisSurfaceState;
  reportPreview?: AnalysisReportPreviewViewModel;
  reportPreviewState: AnalysisSurfaceState;
  runEvents: AnalysisRunEvent[];
  sessionSummary: AnalysisSessionSummaryViewModel;
  sourceEvidence: AnalysisSourceEvidenceViewModel[];
  sourceEvidenceState: AnalysisSurfaceState;
  toolDetails: AnalysisToolDetailViewModel[];
  toolDetailsState: AnalysisSurfaceState;
};

export type AnalysisWorkspaceViewModel = {
  contextPanelNote: string;
  modelOptions: readonly { key: string; label: string }[];
  sessions: AnalysisSessionViewModel[];
};
