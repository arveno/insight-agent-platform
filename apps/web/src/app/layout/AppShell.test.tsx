import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../providers/AppProviders";
import { AppShell } from "./AppShell";

vi.mock("../../shared/graph", () => ({
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

afterEach(cleanup);

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
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

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
  });

  it("switches the static workspace selector and shows simulated refresh feedback", async () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const workspaceButton = screen.getByRole("button", { name: /Northstar Retail China/ });

    fireEvent.click(workspaceButton);
    fireEvent.click(await screen.findByText("East Retail Demo"));

    expect(screen.getByRole("button", { name: /East Retail Demo/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /当前工作区/ })).toBeNull();
    expect(screen.getByText("已模拟刷新当前工作区。")).toBeTruthy();
    expect(screen.getByText("当前工作区: East Retail Demo")).toBeTruthy();
  });

  it("enters analysis session navigation mode and filters the static session list locally", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /分析/ }));

    const analysisNavigation = screen.getByRole("navigation", {
      name: "Analysis session navigation"
    });

    expect(within(analysisNavigation).getByText("分析")).toBeTruthy();
    expect(within(analysisNavigation).getByRole("textbox", { name: "搜索会话" })).toBeTruthy();
    expect(within(analysisNavigation).getByRole("button", { name: /新聊天/ })).toBeTruthy();
    expect(within(analysisNavigation).getByText("Q2 收入异常追问")).toBeTruthy();
    expect(within(analysisNavigation).getByText("毛利率波动复盘")).toBeTruthy();
    expect(within(analysisNavigation).getByText("库存异常定位")).toBeTruthy();
    expect(within(analysisNavigation).queryByText("刚刚更新")).toBeNull();
    expect(within(analysisNavigation).queryByText("成功")).toBeNull();
    expect(
      within(analysisNavigation).queryByText("围绕 Dashboard 收入异常做渠道和时间窗口追问。")
    ).toBeNull();

    fireEvent.change(within(analysisNavigation).getByRole("textbox", { name: "搜索会话" }), {
      target: { value: "毛利率" }
    });

    expect(within(analysisNavigation).queryByText("Q2 收入异常追问")).toBeNull();
    expect(within(analysisNavigation).getByText("毛利率波动复盘")).toBeTruthy();
    expect(within(analysisNavigation).queryByText("库存异常定位")).toBeNull();
  });

  it("updates conversation and inspector when switching analysis sessions", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /分析/ }));

    const analysisNavigation = screen.getByRole("navigation", {
      name: "Analysis session navigation"
    });

    fireEvent.click(within(analysisNavigation).getByText("毛利率波动复盘"));

    const main = screen.getByRole("region", { name: "Analysis conversation" });

    expect(within(main).queryByRole("heading", { name: "分析" })).toBeNull();
    expect(within(main).queryByRole("button", { name: "查看报告" })).toBeNull();
    expect(within(main).queryByRole("button", { name: "查看观测" })).toBeNull();
    expect(
      within(main).getAllByText("来自 Reports / Margin · 毛利率复盘 · This quarter")
    ).toHaveLength(2);
    expect(
      within(main).getByText("复盘本季度毛利率波动，重点解释促销投放和商品结构变化。")
    ).toBeTruthy();
    expect(within(main).getByText(/当前阶段判断倾向于促销档期重叠导致毛利率波动/)).toBeTruthy();
    expect(within(main).getByRole("group", { name: "Analysis composer" })).toBeTruthy();
    expect(within(main).getByRole("textbox", { name: "后续追问" })).toBeTruthy();
    expect(within(main).queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(within(main).queryByText("Feedback / 采纳入口")).toBeNull();

    expect(screen.getByText("Run Trace")).toBeTruthy();
    expect(screen.getByText("runId: analysis-margin-follow-up")).toBeTruthy();
    expect(screen.getByText("1. 接收用户问题")).toBeTruthy();
    expect(screen.getByText("6. 召回 Evidence / RAG 来源")).toBeTruthy();
    expect(screen.getByText("8. 等待用户追问 / 反馈")).toBeTruthy();
    expect(screen.queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(screen.queryByText("Feedback / 采纳入口")).toBeNull();
    expect(screen.queryByText("报告补充入口")).toBeNull();
    expect(screen.queryByText(/技术对接：/)).toBeNull();
  });

  it("opens and closes run trace event detail without leaving analysis", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /分析/ }));

    const analysisNavigation = screen.getByRole("navigation", {
      name: "Analysis session navigation"
    });
    const main = screen.getByRole("region", { name: "Analysis conversation" });

    fireEvent.click(
      screen.getByRole("button", { name: "查看 Trace 事件详情：1. 接收用户问题" })
    );

    const dialog = screen.getByRole("dialog", { name: "Trace Event Detail" });
    expect(within(dialog).getByText("1. 接收用户问题")).toBeTruthy();
    expect(within(dialog).getByText("user_input")).toBeTruthy();
    expect(
      within(dialog).getByText("解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。")
    ).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "关闭详情" }));

    expect(screen.queryByRole("dialog", { name: "Trace Event Detail" })).toBeNull();
    expect(analysisNavigation).toBeTruthy();
    expect(
      within(main).getAllByText("来自 Dashboard / Revenue · 收入增速异常 · Last 30 days")
    ).toHaveLength(2);
    expect(screen.getByText("Run Trace")).toBeTruthy();
  });

  it("enters reports navigation mode and keeps report selection in local UI state", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

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
    expect(screen.getAllByText("reportId: report-inventory-exception-tracking").length).toBeGreaterThan(0);
    expect(screen.getAllByText("runId: run-inventory-exception-tracking").length).toBeGreaterThan(0);
    expect(screen.getByText("evidence: 2")).toBeTruthy();
    expect(screen.getByText("sections: 2")).toBeTruthy();
    expect(screen.queryByText("能力说明")).toBeNull();
    expect(screen.queryByText("技术对接")).toBeNull();
    expect(screen.queryByText("Run Trace")).toBeNull();
  });

  it("enters metrics secondary navigation mode and updates the selected metric detail", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

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
    expect(within(metricsNavigation).queryByRole("button", { name: "带上下文进入 Analysis" })).toBeNull();

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
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

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
    expect(within(dataKnowledgeNavigation).queryByRole("button", { name: "查看 RAG Strategy" })).toBeNull();

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
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

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
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

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
