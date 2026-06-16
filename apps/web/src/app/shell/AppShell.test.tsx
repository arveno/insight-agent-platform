import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type {
  AnalysisRun,
  AnalysisTask,
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
import goldenPathExample from "../../../../../packages/contracts/examples/analysis-runtime/golden-path.json";

import type { AuthSessionViewModel } from "../providers/authViewModel";
import { AppProviders } from "../providers/AppProviders";
import { AppShell } from "./AppShell";

vi.mock("../../shared/graph/RelationshipGraphCanvas", () => ({
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

const testAppShellSession: AuthSessionViewModel & {
  currentWorkspace: NonNullable<AuthSessionViewModel["currentWorkspace"]>;
} = {
  currentWorkspace: {
    membershipId: "membership-test-user-ada-northstar-retail-china",
    name: "Northstar Retail China",
    role: "analyst",
    workspaceId: "workspace-northstar-retail-china"
  },
  user: {
    displayName: "Ada Chen",
    email: "ada@northstar.example.com",
    userId: "user-ada"
  },
  workspaces: [
    {
      membershipId: "membership-test-user-ada-northstar-retail-china",
      name: "Northstar Retail China",
      role: "analyst",
      workspaceId: "workspace-northstar-retail-china"
    },
    {
      membershipId: "membership-test-user-ada-east-retail-demo",
      name: "East Retail Demo",
      role: "viewer",
      workspaceId: "workspace-east-retail-demo"
    },
    {
      membershipId: "membership-test-user-ada-global-ops-sandbox",
      name: "Global Ops Sandbox",
      role: "viewer",
      workspaceId: "workspace-global-ops-sandbox"
    }
  ]
};

type AppShellComponentProps = Parameters<typeof AppShell>[0];

function renderAppShell(overrides: Partial<AppShellComponentProps> = {}) {
  const props: AppShellComponentProps = {
    session: testAppShellSession,
    ...overrides
  };

  return render(
    <AppProviders>
      <AppShell {...props} />
    </AppProviders>
  );
}

function installRuntimeFetchMock(goldenPath: GoldenPathExample) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

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

    throw new Error(`Unhandled request: ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
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

describe("AppShell", () => {
  it("renders primary entries separately from capability preview entries", () => {
    renderAppShell();

    const navigation = screen.getByRole("navigation", { name: "Shell navigation" });

    expect(within(navigation).getByText("主入口")).toBeTruthy();
    expect(within(navigation).getByText("能力预览")).toBeTruthy();
    const dashboardButton = within(navigation).getByRole("button", { name: /仪表盘/ });
    const analysisButton = within(navigation).getByRole("button", { name: /分析/ });
    const dataKnowledgeButton = within(navigation).getByRole("button", { name: /数据与知识/ });
    const reportsButton = within(navigation).getByRole("button", { name: /报告/ });
    const metricsButton = within(navigation).getByRole("button", { name: /指标/ });

    expect(dashboardButton).toBeTruthy();
    expect(analysisButton).toBeTruthy();
    expect(dataKnowledgeButton).toBeTruthy();
    expect(reportsButton).toBeTruthy();
    expect(metricsButton).toBeTruthy();
    expect(dashboardButton.querySelector(".anticon-right")).toBeNull();
    expect(analysisButton.querySelector(".anticon-right")).toBeTruthy();
    expect(dataKnowledgeButton.querySelector(".anticon-right")).toBeTruthy();
    expect(reportsButton.querySelector(".anticon-right")).toBeTruthy();
    expect(metricsButton.querySelector(".anticon-right")).toBeTruthy();
    expect(within(navigation).getByRole("button", { name: /模型与工具/ })).toBeTruthy();
    expect(within(navigation).getByRole("button", { name: /观测/ })).toBeTruthy();
    expect(within(navigation).queryByRole("button", { name: /工作区/ })).toBeNull();
    expect(screen.queryByText("能力说明")).toBeNull();
    expect(screen.queryByText("技术对接")).toBeNull();
  });

  it("renders a workspace dropdown and compact user menu without top-right account actions", async () => {
    renderAppShell();

    expect(screen.getByRole("button", { name: "当前工作区" })).toBeTruthy();
    expect(screen.getByText("Northstar Retail China")).toBeTruthy();
    expect(screen.getAllByText("Ada Chen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("analyst").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "切换工作区" })).toBeNull();
    expect(screen.queryByRole("button", { name: "退出登录" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "用户入口" }));

    expect(await screen.findByText("ada@northstar.example.com")).toBeTruthy();
    expect(screen.getByRole("button", { name: "退出登录" })).toBeTruthy();
    expect(screen.getByText("语言")).toBeTruthy();
    expect(screen.getByText("主题")).toBeTruthy();
  });

  it("selects a workspace from the header dropdown", async () => {
    const onSelectWorkspace = vi.fn().mockResolvedValue(undefined);

    renderAppShell({ onSelectWorkspace });

    fireEvent.click(screen.getByRole("button", { name: "当前工作区" }));
    fireEvent.click(await screen.findByText("East Retail Demo"));

    await waitFor(() => {
      expect(onSelectWorkspace).toHaveBeenCalledWith("workspace-east-retail-demo");
    });
  });

  it("enters analysis mode in draft state when no runtime bootstrap id is available", () => {
    renderAppShell({ currentRoute: "analysis" });

    const analysisNavigation = screen.getByRole("navigation", {
      name: "Analysis session navigation"
    });
    const main = screen.getByRole("region", { name: "Analysis conversation" });

    expect(within(analysisNavigation).getByText("分析")).toBeTruthy();
    expect(within(analysisNavigation).getByRole("textbox", { name: "搜索会话" })).toBeTruthy();
    expect(within(analysisNavigation).getByRole("button", { name: /新聊天/ })).toBeTruthy();
    expect(within(analysisNavigation).queryByText("收入增速异常")).toBeNull();
    expect(within(analysisNavigation).queryByText("毛利率波动分析")).toBeNull();
    expect(within(analysisNavigation).queryByText("库存异常定位")).toBeNull();
    expect(within(analysisNavigation).getByText("暂无匹配会话")).toBeTruthy();
    expect(within(main).getByText("输入问题开始分析")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "输入你想分析的问题" })).toBeTruthy();
    expect(screen.queryByText("Draft Context")).toBeNull();
    expect(screen.queryByText("No analysis runtime selected")).toBeNull();
  });

  it("loads the runtime-backed conversation and inspector when analysis is entered with a bootstrap conversationId", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;
    const fetchMock = installRuntimeFetchMock(goldenPath);
    window.history.replaceState(
      {},
      "",
      `/?conversationId=${encodeURIComponent(goldenPath.conversation.conversationId)}`
    );

    renderAppShell({ currentRoute: "analysis" });

    const analysisNavigation = screen.getByRole("navigation", {
      name: "Analysis session navigation"
    });
    const main = await screen.findByRole("region", { name: "Analysis conversation" });
    const messageList = within(main).getByRole("log", { name: "Analysis message list" });

    expect(within(main).queryByRole("heading", { name: "分析" })).toBeNull();
    expect(within(main).queryByRole("button", { name: "查看报告" })).toBeNull();
    expect(within(main).queryByRole("button", { name: "查看观测" })).toBeNull();
    expect(within(analysisNavigation).getByText("收入增速异常")).toBeTruthy();
    expect(within(messageList).getByText("System")).toBeTruthy();
    expect(within(messageList).getByText("User")).toBeTruthy();
    expect(within(messageList).getByText("Assistant")).toBeTruthy();
    expect(
      within(main).getByText("解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。")
    ).toBeTruthy();
    expect(
      within(main).getAllByText(
        "收入增速下滑主要来自华东核心渠道确认延迟与促销库存错配，而不是整体价格体系失效。"
      )
    ).toHaveLength(1);
    expect(within(main).getByText("点击消息查看本次运行。")).toBeTruthy();
    expect(within(main).getByRole("group", { name: "Analysis composer" })).toBeTruthy();
    expect(within(main).getByRole("textbox", { name: "输入你想分析的问题" })).toBeTruthy();
    expect(within(main).getByText(/Stream completed · 更新于/)).toBeTruthy();
    expect(within(main).queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(within(main).queryByText("Feedback / Bad Case 入口")).toBeNull();

    expect(screen.getAllByText("Run Trace").length).toBeGreaterThan(0);
    expect(screen.getAllByText("run.created").length).toBeGreaterThan(0);
    expect(screen.getByText("tool_call.completed")).toBeTruthy();
    expect(screen.getByText("synthesis.started")).toBeTruthy();
    expect(screen.queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(screen.queryByText("Feedback / Bad Case 入口")).toBeNull();
    expect(screen.queryByText("报告补充入口")).toBeNull();
    expect(screen.queryByText(/技术对接：/)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(11);
  });

  it("switches run trace event detail within the unified inspector without leaving analysis", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;
    const fetchMock = installRuntimeFetchMock(goldenPath);
    window.history.replaceState(
      {},
      "",
      `/?conversationId=${encodeURIComponent(goldenPath.conversation.conversationId)}`
    );

    renderAppShell({ currentRoute: "analysis" });

    const analysisNavigation = screen.getByRole("navigation", {
      name: "Analysis session navigation"
    });
    const main = await screen.findByRole("region", { name: "Analysis conversation" });
    const runCreatedTreeItemName = /run\.created 11:08/;

    fireEvent.click(screen.getByRole("treeitem", { name: runCreatedTreeItemName }));

    expect(screen.getAllByText("run.created").length).toBeGreaterThan(0);
    expect(screen.getAllByText("11:08").length).toBeGreaterThan(0);
    expect(screen.getByText("succeeded")).toBeTruthy();
    expect(screen.getByText("仅摘要")).toBeTruthy();
    expect(screen.getByRole("treeitem", { name: /context\.bound 11:09/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "返回上一级" })).toBeNull();

    expect(screen.getByRole("treeitem", { name: runCreatedTreeItemName })).toBeTruthy();
    expect(analysisNavigation).toBeTruthy();
    expect(within(main).getByText("点击消息查看本次运行。")).toBeTruthy();
    expect(screen.getAllByText("Run Trace").length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledTimes(11);
  });

  it("enters reports navigation mode and keeps report selection in local UI state", () => {
    renderAppShell();

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /报告/ }));

    const reportsNavigation = screen.getByRole("navigation", { name: "Reports navigation" });

    expect(within(reportsNavigation).getByText("报告")).toBeTruthy();
    expect(within(reportsNavigation).getByRole("textbox", { name: "搜索报告" })).toBeTruthy();
    expect(within(reportsNavigation).getByText("周经营分析报告")).toBeTruthy();
    expect(within(reportsNavigation).getByText("毛利率复盘报告")).toBeTruthy();
    expect(within(reportsNavigation).getByText("库存异常跟踪报告")).toBeTruthy();
    expect(within(reportsNavigation).queryByText("4 个证据引用")).toBeNull();

    fireEvent.change(within(reportsNavigation).getByRole("textbox", { name: "搜索报告" }), {
      target: { value: "库存" }
    });

    expect(within(reportsNavigation).queryByText("周经营分析报告")).toBeNull();
    expect(within(reportsNavigation).queryByText("毛利率复盘报告")).toBeNull();
    expect(within(reportsNavigation).getByText("库存异常跟踪报告")).toBeTruthy();

    fireEvent.click(within(reportsNavigation).getByText("库存异常跟踪报告"));

    expect(screen.getAllByText("库存异常跟踪报告").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("reportId: report-inventory-exception-tracking").length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("runId: run-inventory-exception-tracking").length).toBeGreaterThan(
      0
    );
    expect(screen.getByText("证据引用")).toBeTruthy();
    expect(screen.getByText("决策建议")).toBeTruthy();
    expect(screen.queryByText("能力说明")).toBeNull();
    expect(screen.queryByText("技术对接")).toBeNull();
    expect(screen.queryByText("Run Trace")).toBeNull();
  });

  it("enters metrics secondary navigation mode and updates the selected metric detail", () => {
    renderAppShell();

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /指标/ }));

    const metricsNavigation = screen.getByRole("navigation", { name: "Metrics navigation" });

    expect(within(metricsNavigation).getByText("指标")).toBeTruthy();
    expect(within(metricsNavigation).getByRole("textbox", { name: "搜索指标" })).toBeTruthy();
    expect(within(metricsNavigation).getByText("确认收入")).toBeTruthy();
    expect(within(metricsNavigation).getByText("毛利率")).toBeTruthy();
    expect(within(metricsNavigation).getByText("获客成本")).toBeTruthy();
    expect(within(metricsNavigation).queryByText("¥12.8M")).toBeNull();
    expect(within(metricsNavigation).queryByText("最近 30 天环比 -3.2%")).toBeNull();
    expect(
      within(metricsNavigation).queryByRole("button", { name: "带上下文进入 Analysis" })
    ).toBeNull();

    expect(screen.getByText("指标总览")).toBeTruthy();
    expect(screen.getByText("当前指标详情：确认收入")).toBeTruthy();
    expect(screen.getByText("已满足确认条件的收入金额。")).toBeTruthy();
    expect(screen.queryByText("公式与阈值")).toBeNull();
    expect(screen.queryByText("趋势与异常")).toBeNull();
    expect(screen.queryByText("能力说明")).toBeNull();
    expect(screen.queryByText("技术对接")).toBeNull();
    expect(screen.queryByText("当前阶段只保留指标说明区")).toBeNull();

    fireEvent.click(within(metricsNavigation).getByText("毛利率"));

    expect(screen.getByText("当前指标详情：毛利率")).toBeTruthy();
    expect(screen.getByText("收入扣除销售成本后保留的利润比例。")).toBeTruthy();
    expect(screen.getByText("当前摘要")).toBeTruthy();
    expect(screen.getByText("业务定义")).toBeTruthy();
    expect(screen.getByText("阈值 / 异常规则")).toBeTruthy();
    expect(screen.getByText("字段血缘摘要")).toBeTruthy();
    expect(screen.getByText("证据摘要")).toBeTruthy();
    expect(screen.getByRole("button", { name: "带上下文进入 Analysis" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看完整数据血缘" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "新增指标" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑公式" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑阈值" })).toBeNull();
  });

  it("enters data knowledge secondary navigation mode and updates the selected asset detail", () => {
    renderAppShell();

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /数据与知识/ }));

    const dataKnowledgeNavigation = screen.getByRole("navigation", {
      name: "Data & Knowledge navigation"
    });

    expect(within(dataKnowledgeNavigation).getByText("数据与知识资产")).toBeTruthy();
    expect(
      within(dataKnowledgeNavigation).getByRole("textbox", { name: "搜索数据与知识资产" })
    ).toBeTruthy();
    expect(within(dataKnowledgeNavigation).getByText("数据资产 Data")).toBeTruthy();
    expect(within(dataKnowledgeNavigation).getByText("知识文档 Docs")).toBeTruthy();
    expect(within(dataKnowledgeNavigation).getByText("CRM Revenue Warehouse")).toBeTruthy();
    expect(within(dataKnowledgeNavigation).getByText("Finance Knowledge Base")).toBeTruthy();
    expect(within(dataKnowledgeNavigation).getByText("渠道经营周报")).toBeTruthy();
    expect(within(dataKnowledgeNavigation).queryByText("ready")).toBeNull();
    expect(within(dataKnowledgeNavigation).queryByText("low")).toBeNull();
    expect(within(dataKnowledgeNavigation).queryByText("medium")).toBeNull();
    expect(within(dataKnowledgeNavigation).queryByText("sales_order")).toBeNull();
    expect(
      within(dataKnowledgeNavigation).queryByRole("button", { name: "查看 RAG Strategy" })
    ).toBeNull();

    expect(screen.queryByText("Data & Knowledge 总览")).toBeNull();
    expect(screen.getByText("当前资产")).toBeTruthy();
    expect(screen.getByText("Asset relationship graph")).toBeTruthy();
    expect(screen.getAllByText("CRM Revenue Warehouse").length).toBeGreaterThan(0);
    expect(screen.getAllByText("dataSourceId: data-source-crm-revenue").length).toBeGreaterThan(0);
    expect(screen.getByText("Workspace Overview")).toBeTruthy();
    expect(screen.getByText("Readonly Boundary")).toBeTruthy();
    expect(screen.getByText("Quality & Operations Summary")).toBeTruthy();
    expect(screen.getByText("Actions")).toBeTruthy();
    expect(screen.getByText("Technical Boundary")).toBeTruthy();

    fireEvent.click(within(dataKnowledgeNavigation).getByText("渠道经营周报"));

    expect(screen.getAllByText("渠道经营周报").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "渠道复盘章节" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "促销与获客成本" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "渠道经营周报文档证据" })).toBeTruthy();
    expect(
      screen.getAllByText("knowledgeDocumentId: knowledge-document-channel-weekly").length
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "查看 RAG Strategy" })).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: "查看 Platform Operations" }).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText("真实 ingestion")).toBeNull();
    expect(screen.queryByText("真实 vector search")).toBeNull();
  });

  it("keeps the selected relationship node within one asset and resets only after switching assets", () => {
    renderAppShell();

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /数据与知识/ }));

    const dataKnowledgeNavigation = screen.getByRole("navigation", {
      name: "Data & Knowledge navigation"
    });

    expect(screen.getByText("selectedNodeId: data_source:data-source-crm-revenue")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "recognized_revenue" }));

    expect(
      screen.getByText("selectedNodeId: data_field:field-sales-order-recognized-revenue")
    ).toBeTruthy();
    expect(screen.getByText("fieldId: field-sales-order-recognized-revenue")).toBeTruthy();

    fireEvent.click(within(dataKnowledgeNavigation).getByText("Finance Knowledge Base"));

    expect(
      screen.getByText("selectedNodeId: knowledge_document:knowledge-document-finance-kb")
    ).toBeTruthy();
    expect(
      screen.getAllByText("knowledgeDocumentId: knowledge-document-finance-kb").length
    ).toBeGreaterThan(0);
  });

  it("opens platform operations without the old inspector and keeps the page readonly", () => {
    renderAppShell();

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /平台运维/ }));

    expect(screen.getByText("平台运维总览")).toBeTruthy();
    expect(screen.getByText("当前选中对象详情：nightly-data-quality")).toBeTruthy();
    expect(screen.queryByText("能力说明")).toBeNull();
    expect(screen.queryByText("技术对接")).toBeNull();
    expect(screen.queryByText("当前阶段只保留平台运维说明区")).toBeNull();
    expect(screen.queryByText("平台运维辅助区")).toBeNull();
    expect(screen.queryByRole("button", { name: "执行真实 Job" })).toBeNull();
    expect(screen.queryByRole("button", { name: "执行部署" })).toBeNull();
  });
});
