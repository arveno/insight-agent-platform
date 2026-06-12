import type {
  AnalysisRun as AnalysisRunContract,
  Conversation as ConversationContract,
  Decision,
  Message as MessageContract,
  MessageStream as MessageStreamContract,
  ModelCall,
  Report,
  RunEvent as RunEventContract,
  SourceEvidence,
  ToolCall
} from "@insight-agent/contracts/generated/typescript";

export type {
  AnalysisRunContract,
  ConversationContract,
  Decision,
  MessageContract,
  MessageStreamContract,
  ModelCall,
  Report,
  RunEventContract,
  SourceEvidence,
  ToolCall
};

export type AnalysisRunStatus = AnalysisRunContract["status"];
export type AnalysisRunEventStatus = RunEventContract["status"];
export type AnalysisRunEventType = RunEventContract["eventType"];
export type ConversationStatus = ConversationContract["status"];
export type MessageRole = MessageContract["role"];
export type MessageStatus = MessageContract["status"];
export type MessageStreamEventType = MessageStreamContract["eventType"];
export type MessageStreamStatus = MessageStreamContract["status"];
