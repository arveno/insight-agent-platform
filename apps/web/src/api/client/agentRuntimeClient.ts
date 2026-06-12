import type {
  AnalysisRun,
  Conversation,
  Decision,
  Message,
  MessageStream,
  ModelCall,
  Report,
  RunEvent,
  SourceEvidence,
  ToolCall
} from "@insight-agent/contracts/generated/typescript";

type ListResponse<T> = {
  items: T[];
};

type RuntimeErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class RuntimeApiError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.code = code;
    this.name = "RuntimeApiError";
    this.status = status;
  }
}

function resolveAgentRuntimeBaseUrl(): string {
  const envBaseUrl = import.meta.env.VITE_AGENT_RUNTIME_BASE_URL;

  if (typeof envBaseUrl === "string" && envBaseUrl.trim().length > 0) {
    return envBaseUrl.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "http://127.0.0.1:8000";
  }

  const { hostname, origin, port, protocol } = window.location;

  if ((hostname === "127.0.0.1" || hostname === "localhost") && port !== "8000") {
    return `${protocol}//127.0.0.1:8000`;
  }

  return origin;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function readError(response: Response): Promise<RuntimeApiError> {
  let payload: RuntimeErrorPayload | null = null;

  try {
    payload = await parseJsonResponse<RuntimeErrorPayload>(response);
  } catch {
    payload = null;
  }

  return new RuntimeApiError(
    payload?.error?.message ?? `Runtime API request failed with status ${response.status}.`,
    response.status,
    payload?.error?.code
  );
}

export class AgentRuntimeClient {
  readonly baseUrl: string;

  constructor(baseUrl = resolveAgentRuntimeBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  private async request(path: string, accept = "application/json"): Promise<Response> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          Accept: accept
        },
        method: "GET"
      });
    } catch (error) {
      throw new RuntimeApiError(
        error instanceof Error ? error.message : "Runtime API request failed.",
        0
      );
    }

    if (!response.ok) {
      throw await readError(response);
    }

    return response;
  }

  private async get<T>(path: string, accept = "application/json"): Promise<T> {
    const response = await this.request(path, accept);

    return parseJsonResponse<T>(response);
  }

  getConversation(conversationId: string) {
    return this.get<Conversation>(`/conversations/${conversationId}`);
  }

  getAnalysisRun(runId: string) {
    return this.get<AnalysisRun>(`/analysis-runs/${runId}`);
  }

  getRunConversation(runId: string) {
    return this.get<Conversation>(`/analysis-runs/${runId}/conversation`);
  }

  listConversationMessages(conversationId: string) {
    return this.get<ListResponse<Message>>(`/conversations/${conversationId}/messages`);
  }

  listMessageStream(conversationId: string, messageId: string) {
    return this.get<ListResponse<MessageStream>>(
      `/conversations/${conversationId}/messages/${messageId}/stream`
    );
  }

  streamMessageStream(conversationId: string, messageId: string) {
    return this.request(
      `/conversations/${conversationId}/messages/${messageId}/stream`,
      "text/event-stream"
    );
  }

  listRunEvents(runId: string) {
    return this.get<ListResponse<RunEvent>>(`/analysis-runs/${runId}/events`);
  }

  listToolCalls(runId: string) {
    return this.get<ListResponse<ToolCall>>(`/analysis-runs/${runId}/tool-calls`);
  }

  listModelCalls(runId: string) {
    return this.get<ListResponse<ModelCall>>(`/analysis-runs/${runId}/model-calls`);
  }

  listSourceEvidence(runId: string) {
    return this.get<ListResponse<SourceEvidence>>(`/analysis-runs/${runId}/source-evidence`);
  }

  listReports(runId: string) {
    return this.get<ListResponse<Report>>(`/analysis-runs/${runId}/reports`);
  }

  listDecisions(runId: string) {
    return this.get<ListResponse<Decision>>(`/analysis-runs/${runId}/decisions`);
  }
}
