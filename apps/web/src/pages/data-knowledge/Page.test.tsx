import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { DataKnowledgePage } from "./Page";

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
});

describe("DataKnowledgePage", () => {
  it("renders the management page as overview plus selected asset detail instead of the old generic capability tabs", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <DataKnowledgePage onNavigate={onNavigate} />
      </AppProviders>
    );

    expect(screen.getByText("Data & Knowledge 总览")).toBeTruthy();
    expect(screen.getByText("当前资产详情")).toBeTruthy();
    expect(screen.getByText("Schema 与 Chunk 摘要")).toBeTruthy();
    expect(screen.getByText("Evidence 与 Lineage")).toBeTruthy();
    expect(screen.getByText("Quality 与 Operations")).toBeTruthy();
    expect(screen.getByText("Workspace 绑定")).toBeTruthy();
    expect(screen.getByText("只读边界")).toBeTruthy();
    expect(screen.getByText("当前选中资产详情：CRM Revenue Warehouse")).toBeTruthy();
    expect(screen.getByText("dataSourceId: data-source-crm-revenue")).toBeTruthy();
    expect(screen.getByText("关联数据表")).toBeTruthy();
    expect(screen.getByText("关键字段")).toBeTruthy();
    expect(screen.getByText("SourceEvidence 列表")).toBeTruthy();
    expect(screen.getByText("DataQualityCheck 摘要")).toBeTruthy();
    expect(screen.queryByText("索引管理")).toBeNull();
    expect(screen.queryByText("数据采集")).toBeNull();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("keeps actions navigation-only and does not create a real analysis run", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <DataKnowledgePage onNavigate={onNavigate} />
      </AppProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "带当前资产进入 Analysis" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("analysis");
    expect(screen.queryByText("真实 conversation")).toBeNull();
    expect(screen.queryByText("真实 run")).toBeNull();
  });
});
