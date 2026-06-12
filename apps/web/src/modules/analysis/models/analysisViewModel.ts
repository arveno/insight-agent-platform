import type { DraftContextPack } from "../../../shared/navigation/navigationTypes";
import type {
  SharedRiskViewModel,
  SharedStatusViewModel
} from "../../../shared/utils/viewModelState";

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

export type AnalysisContextPackViewModel = {
  sourceObject: string;
  sourceRoute: string;
  stripText: string;
  systemText: string;
  timeRange: string;
  workspace: string;
};

export type AnalysisDraftContextViewModel = DraftContextPack;

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

export type AnalysisResultSummaryViewModel = {
  actionSuggestions: string[];
  conclusion: string;
  evidenceSummary: string;
  findingBullets: string[];
  key: string;
  riskViewModel?: SharedRiskViewModel;
  statusViewModel: SharedStatusViewModel;
  title: string;
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

export type AnalysisMemoryContextViewModel = {
  memoryItemId: string;
  summary: string;
  title: string;
};

export type AnalysisInspectorRouteKey =
  | "home"
  | "context-origin"
  | "source-ref"
  | "run-trace"
  | "run-event"
  | "report-preview"
  | "decision"
  | "tool-call"
  | "model-call";

export type AnalysisInspectorRouteNode =
  | { key: "home" }
  | { key: "context-origin" }
  | { key: "source-ref" }
  | { key: "run-trace" }
  | { eventId: string; key: "run-event" }
  | { key: "report-preview" }
  | { key: "decision" }
  | { key: "tool-call" }
  | { key: "model-call" };

export type AnalysisComposerMode = "analysis" | "follow_up";

export type AnalysisSessionViewModel = {
  conversationId: string;
  currentRun: AnalysisRun;
  contextPack: AnalysisContextPackViewModel;
  decisions: AnalysisDecisionViewModel[];
  decisionsState: AnalysisSurfaceState;
  followUpComposer: AnalysisComposerViewModel;
  inputComposer: AnalysisComposerViewModel;
  memoryContext?: AnalysisMemoryContextViewModel;
  messageStream?: AnalysisMessageStreamViewModel;
  messageStreamState: AnalysisSurfaceState;
  messages: AnalysisMessage[];
  modelDetails: AnalysisModelDetailViewModel[];
  modelDetailsState: AnalysisSurfaceState;
  reportPreview?: AnalysisReportPreviewViewModel;
  reportPreviewState: AnalysisSurfaceState;
  resultSummary: AnalysisResultSummaryViewModel;
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
