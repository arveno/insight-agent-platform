import type {
  AnalysisRun as AnalysisRunContract,
  Conversation as ConversationContract,
  Message as MessageContract,
  MessageStream as MessageStreamContract,
  RunEvent as RunEventContract
} from "@insight-agent/contracts/generated/typescript";

export type {
  AnalysisRunContract,
  ConversationContract,
  MessageContract,
  MessageStreamContract,
  RunEventContract
};

export type AnalysisRunStatus = AnalysisRunContract["status"];
export type AnalysisRunEventStatus = RunEventContract["status"];
export type AnalysisRunEventType = RunEventContract["eventType"];
export type ConversationStatus = ConversationContract["status"];
export type MessageRole = MessageContract["role"];
export type MessageStatus = MessageContract["status"];
export type MessageStreamEventType = MessageStreamContract["eventType"];
export type MessageStreamStatus = MessageStreamContract["status"];
