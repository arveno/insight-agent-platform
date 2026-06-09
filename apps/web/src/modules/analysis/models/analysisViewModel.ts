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

export type AnalysisToolDetailViewModel = {
  runId: string;
  statusViewModel: SharedStatusViewModel;
  summary: string;
  toolCallId: string;
  toolName: string;
};

export type AnalysisSourceEvidenceViewModel = {
  runId: string;
  sourceEvidenceId: string;
  sourceType: string;
  summary: string;
  title: string;
};

export type AnalysisReportPreviewViewModel = {
  reportId: string;
  runId: string;
  summary: string;
  title: string;
};

export type AnalysisMemoryContextViewModel = {
  memoryItemId: string;
  summary: string;
  title: string;
};

export type AnalysisInspectorPanelKey =
  | "run-trace"
  | "tool-detail"
  | "source-evidence"
  | "report-preview"
  | "memory-context";

export type AnalysisComposerMode = "analysis" | "follow_up";

export type AnalysisSessionViewModel = {
  conversationId: string;
  currentRun: AnalysisRun;
  contextPack: AnalysisContextPackViewModel;
  followUpComposer: AnalysisComposerViewModel;
  inputComposer: AnalysisComposerViewModel;
  memoryContext?: AnalysisMemoryContextViewModel;
  messages: AnalysisMessage[];
  reportPreview?: AnalysisReportPreviewViewModel;
  resultSummary: AnalysisResultSummaryViewModel;
  runEvents: AnalysisRunEvent[];
  sessionSummary: AnalysisSessionSummaryViewModel;
  sourceEvidence: AnalysisSourceEvidenceViewModel[];
  toolDetails: AnalysisToolDetailViewModel[];
};

export type AnalysisWorkspaceViewModel = {
  contextPanelNote: string;
  modelOptions: readonly { key: string; label: string }[];
  sessions: AnalysisSessionViewModel[];
};
