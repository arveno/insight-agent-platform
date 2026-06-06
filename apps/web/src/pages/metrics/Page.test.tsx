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
  it("renders the metrics overview sections with readonly workspace-bound semantics", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <MetricsPage onNavigate={onNavigate} />
      </AppProviders>
    );

    expect(screen.getByText("指标总览")).toBeTruthy();
    expect(screen.getByText("指标目录")).toBeTruthy();
    expect(screen.getByText("公式与阈值")).toBeTruthy();
    expect(screen.getByText("趋势与异常")).toBeTruthy();
    expect(screen.getByText("血缘与字段来源")).toBeTruthy();
    expect(screen.getAllByText("证据入口").length).toBeGreaterThan(0);
    expect(screen.getAllByText("带上下文进入 Analysis").length).toBeGreaterThan(0);

    expect(screen.getByText("当前指标目录属于当前 Workspace。")).toBeTruthy();
    expect(screen.getByText("Metrics 当前阶段只读展示指标语义，不提供新增、编辑或真实计算。")).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("uses analysis entry actions as navigation-only context handoff", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <MetricsPage onNavigate={onNavigate} />
      </AppProviders>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "带上下文进入 Analysis" })[0]);

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("analysis");
    expect(screen.queryByRole("button", { name: "新增指标" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑公式" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑阈值" })).toBeNull();
  });
});
