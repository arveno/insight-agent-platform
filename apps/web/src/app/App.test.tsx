import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type {
  AnalysisRun,
  AnalysisTask,
  AuthSession,
  Conversation,
  CurrentWorkspaceContext,
  Decision,
  MeResponse,
  Message,
  MessageStream,
  ModelCall,
  Report,
  RunEvent,
  SelectWorkspaceResponse,
  SourceEvidence,
  ToolCall,
  WorkspaceListResponse,
  WorkspaceMembership
} from "@insight-agent/contracts/generated/typescript";
import goldenPathExample from "../../../../packages/contracts/examples/analysis-runtime/golden-path.json";
import { runtimeMetricsFixtures } from "../shared/test/fixtures/runtimeMetrics";

import { App } from "./App";

vi.mock("../shared/graph/RelationshipGraphCanvas", () => ({
  RelationshipGraphCanvas: ({
    graph,
    onSelectNode,
    selectedNodeId
  }: {
    graph: {
      description?: string;
      nodes: Array<{ label: string; nodeId: string }>;
      selectedNodeId?: string;
      title: string;
    };
    onSelectNode?: (nodeId: string) => void;
    selectedNodeId?: string;
  }) => (
    <div aria-label={graph.title}>
      <p>{graph.description}</p>
      <p>{`selectedNodeId: ${selectedNodeId ?? graph.selectedNodeId ?? ""}`}</p>
      {graph.nodes.map((node) => (
        <button key={node.nodeId} onClick={() => onSelectNode?.(node.nodeId)} type="button">
          {node.label}
        </button>
      ))}
    </div>
  )
}));

type GoldenPathExample = {
  analysisRun: AnalysisRun;
  analysisTask: AnalysisTask;
  conversation: Conversation;
  decisions: Decision[];
  messageStream: MessageStream[];
  messages: Message[];
  modelCalls: ModelCall[];
  reports: Report[];
  runEvents: RunEvent[];
  sourceEvidence: SourceEvidence[];
  toolCalls: ToolCall[];
};

const user = {
  createdAt: "2026-06-12T10:28:00+08:00",
  displayName: "Zoe Chen",
  email: "zoe@northstar.example.com",
  updatedAt: "2026-06-12T10:28:00+08:00",
  userId: "user-zoe"
} as const;

const workspaceChina = {
  createdAt: "2026-06-12T10:28:00+08:00",
  name: "Northstar Retail China",
  updatedAt: "2026-06-12T10:28:00+08:00",
  workspaceId: "workspace-northstar-retail-china"
} as const;

const workspaceSea = {
  createdAt: "2026-06-12T10:28:00+08:00",
  name: "Northstar Retail SEA",
  updatedAt: "2026-06-12T10:28:00+08:00",
  workspaceId: "workspace-northstar-retail-sea"
} as const;

const membershipChina: WorkspaceMembership = {
  createdAt: "2026-06-12T10:28:00+08:00",
  membershipId: "membership-user-zoe-northstar-retail-china",
  role: "analyst",
  updatedAt: "2026-06-12T10:28:00+08:00",
  userId: user.userId,
  workspaceId: workspaceChina.workspaceId
};

const membershipSea: WorkspaceMembership = {
  createdAt: "2026-06-12T10:28:00+08:00",
  membershipId: "membership-user-zoe-northstar-retail-sea",
  role: "viewer",
  updatedAt: "2026-06-12T10:28:00+08:00",
  userId: user.userId,
  workspaceId: workspaceSea.workspaceId
};

const workspaceListResponse: WorkspaceListResponse = {
  items: [
    {
      membership: membershipChina,
      workspace: workspaceChina
    },
    {
      membership: membershipSea,
      workspace: workspaceSea
    }
  ]
};

function buildCurrentWorkspaceContext(
  currentWorkspaceId: string | null
): CurrentWorkspaceContext | null {
  if (currentWorkspaceId === workspaceChina.workspaceId) {
    return {
      membershipId: membershipChina.membershipId,
      role: membershipChina.role,
      userId: membershipChina.userId,
      workspaceId: membershipChina.workspaceId
    };
  }

  if (currentWorkspaceId === workspaceSea.workspaceId) {
    return {
      membershipId: membershipSea.membershipId,
      role: membershipSea.role,
      userId: membershipSea.userId,
      workspaceId: membershipSea.workspaceId
    };
  }

  return null;
}

function buildAuthSession(currentWorkspaceId: string | null): AuthSession {
  return {
    authSessionId: "auth-session-user-zoe-web",
    createdAt: "2026-06-12T10:28:00+08:00",
    currentWorkspaceId,
    expiresAt: "2026-07-15T11:08:12+08:00",
    lastAccessedAt: "2026-06-12T10:28:00+08:00",
    updatedAt: "2026-06-12T10:28:00+08:00",
    userId: user.userId
  };
}

function buildMeResponse(currentWorkspaceId: string | null): MeResponse {
  return {
    authSession: buildAuthSession(currentWorkspaceId),
    currentWorkspaceContext: buildCurrentWorkspaceContext(currentWorkspaceId),
    user
  };
}

function buildSelectWorkspaceResponse(workspaceId: string): SelectWorkspaceResponse {
  return {
    authSession: buildAuthSession(workspaceId),
    currentWorkspaceContext: buildCurrentWorkspaceContext(workspaceId)!
  };
}

function installAuthFetchMock(options?: {
  authenticated?: boolean;
  currentWorkspaceId?: string | null;
  loginCurrentWorkspaceId?: string | null;
  runtimeGoldenPath?: GoldenPathExample;
}) {
  const state = {
    authenticated: options?.authenticated ?? false,
    currentWorkspaceId: options?.currentWorkspaceId ?? null
  };
  const goldenPath = options?.runtimeGoldenPath;
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.endsWith("/auth/me")) {
      if (!state.authenticated) {
        return Response.json(
          {
            errorCode: "UNAUTHENTICATED",
            message: "Authentication required."
          },
          { status: 401 }
        );
      }

      return Response.json(buildMeResponse(state.currentWorkspaceId));
    }

    if (url.endsWith("/auth/login")) {
      const payload = JSON.parse(String(init?.body ?? "{}")) as {
        email?: string;
        password?: string;
      };

      if (payload.email !== user.email || payload.password !== "zoe-password") {
        return Response.json(
          {
            errorCode: "INVALID_CREDENTIALS",
            message: "Invalid email or password."
          },
          { status: 401 }
        );
      }

      state.authenticated = true;
      state.currentWorkspaceId = options?.loginCurrentWorkspaceId ?? null;

      return Response.json({
        authSession: buildAuthSession(state.currentWorkspaceId),
        currentWorkspaceContext: buildCurrentWorkspaceContext(state.currentWorkspaceId),
        memberships: [membershipChina, membershipSea],
        user
      });
    }

    if (url.endsWith("/workspaces")) {
      if (!state.authenticated) {
        return Response.json(
          {
            errorCode: "UNAUTHENTICATED",
            message: "Authentication required."
          },
          { status: 401 }
        );
      }

      return Response.json(workspaceListResponse);
    }

    if (url.endsWith("/auth/select-workspace")) {
      if (!state.authenticated) {
        return Response.json(
          {
            errorCode: "UNAUTHENTICATED",
            message: "Authentication required."
          },
          { status: 401 }
        );
      }

      const payload = JSON.parse(String(init?.body ?? "{}")) as { workspaceId: string };

      state.currentWorkspaceId = payload.workspaceId;

      return Response.json(buildSelectWorkspaceResponse(payload.workspaceId));
    }

    if (url.endsWith("/auth/logout")) {
      state.authenticated = false;
      state.currentWorkspaceId = null;

      return Response.json({ success: true });
    }

    if (url.endsWith("/metrics")) {
      return Response.json({ items: runtimeMetricsFixtures });
    }

    if (!goldenPath) {
      throw new Error(`Unhandled request: ${method} ${url}`);
    }

    if (url.endsWith(`/conversations/${goldenPath.conversation.conversationId}`)) {
      return Response.json(goldenPath.conversation);
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}`)) {
      return Response.json(goldenPath.analysisRun);
    }

    if (url.endsWith(`/analysis-tasks/${goldenPath.analysisTask.analysisTaskId}`)) {
      return Response.json(goldenPath.analysisTask);
    }

    if (url.endsWith(`/conversations/${goldenPath.conversation.conversationId}/messages`)) {
      return Response.json({ items: goldenPath.messages });
    }

    if (
      url.endsWith(
        `/conversations/${goldenPath.conversation.conversationId}/messages/${goldenPath.messages[2]!.messageId}/stream`
      )
    ) {
      return Response.json({ items: goldenPath.messageStream });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/events`)) {
      return Response.json({ items: goldenPath.runEvents });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/tool-calls`)) {
      return Response.json({ items: goldenPath.toolCalls });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/model-calls`)) {
      return Response.json({ items: goldenPath.modelCalls });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/source-evidence`)) {
      return Response.json({ items: goldenPath.sourceEvidence });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/reports`)) {
      return Response.json({ items: goldenPath.reports });
    }

    if (url.endsWith(`/analysis-runs/${goldenPath.analysisRun.runId}/decisions`)) {
      return Response.json({ items: goldenPath.decisions });
    }

    throw new Error(`Unhandled request: ${method} ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);

  return { fetchMock, state };
}

function renderAppAt(url = "/") {
  window.history.replaceState({}, "", url);

  return render(<App />);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined
    })
  });

  const originalGetComputedStyle = window.getComputedStyle.bind(window);

  Object.defineProperty(window, "getComputedStyle", {
    configurable: true,
    value: (element: Element) => originalGetComputedStyle(element)
  });
});

describe("App", () => {
  it("redirects unauthenticated business routes to /login", async () => {
    installAuthFetchMock();

    renderAppAt("/dashboard");

    expect(await screen.findByRole("heading", { name: "登录 Insight Agent" })).toBeTruthy();
    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
      expect(window.location.search).toContain("redirect=%2Fdashboard");
    });
  });

  it("hides seed credentials on the login page by default", async () => {
    installAuthFetchMock();

    renderAppAt("/login");

    expect(await screen.findByRole("heading", { name: "登录 Insight Agent" })).toBeTruthy();
    expect(screen.queryByText("Seed user:")).toBeNull();
    expect(screen.queryByText("zoe@northstar.example.com")).toBeNull();
    expect(screen.queryByText("zoe-password")).toBeNull();
    expect(screen.queryByPlaceholderText("zoe@northstar.example.com")).toBeNull();
    expect(screen.queryByPlaceholderText("zoe-password")).toBeNull();
  });

  it("shows the runtime auth error on failed login", async () => {
    installAuthFetchMock();

    renderAppAt("/login");

    expect(await screen.findByRole("heading", { name: "登录 Insight Agent" })).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "邮箱" }), {
      target: { value: "zoe@northstar.example.com" }
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "wrong-password" }
    });
    fireEvent.click(screen.getByRole("button", { name: /登\s*录/ }));

    expect(await screen.findByText("Invalid email or password.")).toBeTruthy();
    expect(window.location.pathname).toBe("/login");
  });

  it("sends successful login users to workspace selection and shows formal workspace data", async () => {
    installAuthFetchMock({ loginCurrentWorkspaceId: null });

    renderAppAt("/dashboard");

    expect(await screen.findByRole("heading", { name: "登录 Insight Agent" })).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "邮箱" }), {
      target: { value: "zoe@northstar.example.com" }
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "zoe-password" }
    });
    fireEvent.click(screen.getByRole("button", { name: /登\s*录/ }));

    expect(await screen.findByRole("heading", { name: "选择工作区" })).toBeTruthy();
    expect(screen.getAllByText("Northstar Retail China").length).toBeGreaterThan(0);
    expect(screen.getByText("Northstar Retail SEA")).toBeTruthy();
    expect(screen.getByText("analyst")).toBeTruthy();
    expect(screen.getByText("viewer")).toBeTruthy();
    expect(window.location.pathname).toBe("/select-workspace");
  });

  it("selects a workspace, enters the protected route, and shows current user/workspace/role in Header", async () => {
    installAuthFetchMock({ loginCurrentWorkspaceId: null });

    renderAppAt("/dashboard");

    expect(await screen.findByRole("heading", { name: "登录 Insight Agent" })).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "邮箱" }), {
      target: { value: "zoe@northstar.example.com" }
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "zoe-password" }
    });
    fireEvent.click(screen.getByRole("button", { name: /登\s*录/ }));

    const chinaCard = (await screen.findByText("Northstar Retail China")).closest(
      ".ant-card"
    ) as HTMLElement | null;
    if (!chinaCard) {
      throw new Error("Expected workspace card for Northstar Retail China.");
    }

    fireEvent.click(within(chinaCard).getByRole("button", { name: "进入工作区" }));

    expect(await screen.findByText("当前展示最近 30 天内的指标摘要、异常和报告入口。")).toBeTruthy();
    expect(window.location.pathname).toBe("/dashboard");
    expect(screen.getAllByText("Northstar Retail China").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Zoe Chen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("analyst").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "用户入口" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "退出登录" })).toBeNull();
    expect(screen.queryByRole("button", { name: "切换工作区" })).toBeNull();
  });

  it("logs out and returns to /login", async () => {
    installAuthFetchMock({
      authenticated: true,
      currentWorkspaceId: workspaceChina.workspaceId
    });

    renderAppAt("/dashboard");

    expect(await screen.findByText("当前展示最近 30 天内的指标摘要、异常和报告入口。")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "用户入口" }));
    fireEvent.click(await screen.findByRole("button", { name: "退出登录" }));

    expect(await screen.findByRole("heading", { name: "登录 Insight Agent" })).toBeTruthy();
    expect(window.location.pathname).toBe("/login");
  });

  it("clears analysis selection state after switching workspace", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;

    installAuthFetchMock({
      authenticated: true,
      currentWorkspaceId: workspaceChina.workspaceId,
      runtimeGoldenPath: goldenPath
    });

    renderAppAt(
      `/analysis?conversationId=${encodeURIComponent(goldenPath.conversation.conversationId)}`
    );

    expect(await screen.findByText("收入增速异常")).toBeTruthy();
    expect(screen.getAllByText("Run Trace").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "当前工作区" }));
    fireEvent.click(await screen.findByText("Northstar Retail SEA"));

    expect(await screen.findByText("输入问题开始分析")).toBeTruthy();
    expect(screen.queryByText("收入增速异常")).toBeNull();
    expect(screen.getByText("Northstar Retail SEA")).toBeTruthy();
    expect(screen.getAllByText("viewer").length).toBeGreaterThan(0);
    expect(window.location.pathname).toBe("/analysis");
    expect(window.location.search).toBe("");
  });
});
