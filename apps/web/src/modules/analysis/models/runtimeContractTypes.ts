import type {
  AnalysisRun as AnalysisRunContract,
  AnalysisTask,
  AnalysisTaskContextPack,
  Conversation as ConversationContract,
  Decision,
  Message as MessageContract,
  MessageStream as MessageStreamContract,
  ModelCall,
  Report,
  RunEvent as RunEventContract,
  SourceEvidence,
  SubmitAnalysisDraftRequest,
  SubmitAnalysisDraftResponse,
  ToolCall
} from "@insight-agent/contracts/generated/typescript";

export type {
  AnalysisTask,
  AnalysisTaskContextPack,
  AnalysisRunContract,
  ConversationContract,
  Decision,
  MessageContract,
  MessageStreamContract,
  ModelCall,
  Report,
  RunEventContract,
  SourceEvidence,
  SubmitAnalysisDraftRequest,
  SubmitAnalysisDraftResponse,
  ToolCall
};

export type AnalysisRunStatus = AnalysisRunContract["status"];
export type AnalysisRunPhase = AnalysisRunContract["phase"];
export type AnalysisRunEventStatus = RunEventContract["status"];
export type AnalysisRunEventType = RunEventContract["eventType"];
export type ConversationStatus = ConversationContract["status"];
export type MessageRole = MessageContract["role"];
export type MessageStatus = MessageContract["status"];
export type MessageStreamEventType = MessageStreamContract["eventType"];
export type MessageStreamStatus = MessageStreamContract["status"];
