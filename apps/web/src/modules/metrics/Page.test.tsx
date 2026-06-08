import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { MetricsPage } from "./Page";

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

describe("MetricsPage", () => {
  it("renders metrics as overview plus selected metric detail instead of flat capability sections", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <MetricsPage onNavigate={onNavigate} />
      </AppProviders>
    );

    expect(screen.getByText("指标总览")).toBeTruthy();
    expect(screen.getByText("当前指标详情：确认收入")).toBeTruthy();
    expect(screen.getByText("业务定义")).toBeTruthy();
    expect(screen.getByText("当前摘要")).toBeTruthy();
    expect(screen.getByText("公式")).toBeTruthy();
    expect(screen.getByText("阈值 / 异常规则")).toBeTruthy();
    expect(screen.getByText("字段血缘摘要")).toBeTruthy();
    expect(screen.getByText("证据摘要")).toBeTruthy();
    expect(screen.getByText("动作")).toBeTruthy();
    expect(screen.getByText("已满足确认条件的收入金额。")).toBeTruthy();
    expect(screen.getByText("当前指标目录属于当前 Workspace。")).toBeTruthy();
    expect(screen.getByText("Metrics 当前阶段只读展示指标语义，不提供新增、编辑或真实计算。")).toBeTruthy();
    expect(screen.queryByText("指标目录")).toBeNull();
    expect(screen.queryByText("公式与阈值")).toBeNull();
    expect(screen.queryByText("趋势与异常")).toBeNull();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("uses analysis entry actions as navigation-only context handoff", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <MetricsPage onNavigate={onNavigate} />
      </AppProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "带上下文进入 Analysis" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("analysis");
    expect(screen.queryByRole("button", { name: "新增指标" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑公式" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑阈值" })).toBeNull();
    expect(screen.queryByText("真实 conversation")).toBeNull();
  });
});
