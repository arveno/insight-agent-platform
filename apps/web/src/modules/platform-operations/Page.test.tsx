import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { PlatformOperationsPage } from "./Page";

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

describe("PlatformOperationsPage", () => {
  it("renders platform operations as a readonly workspace health overview instead of the old static composition", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <PlatformOperationsPage onNavigate={onNavigate} />
      </AppProviders>
    );

    expect(screen.getByText("平台运维总览")).toBeTruthy();
    expect(screen.getByText("Job 与数据质量")).toBeTruthy();
    expect(screen.getByText("平台状态摘要")).toBeTruthy();
    expect(screen.getByText("风险与跳转入口")).toBeTruthy();
    expect(screen.getByText("Workspace 绑定")).toBeTruthy();
    expect(screen.getByText("只读边界")).toBeTruthy();
    expect(screen.getByText("当前选中对象详情：nightly-data-quality")).toBeTruthy();
    expect(screen.getByText("当前展示的是当前 Workspace 的平台与数据链路健康状态。")).toBeTruthy();
    expect(
      screen.getByText("不执行真实 Job，不执行真实数据质量检查，不执行部署、migration 或 smoke。")
    ).toBeTruthy();
    expect(screen.getByText("nightly-data-quality")).toBeTruthy();
    expect(screen.getByText("Revenue completeness")).toBeTruthy();
    expect(screen.getByText("Deployment")).toBeTruthy();
    expect(screen.getByText("Smoke")).toBeTruthy();
    expect(screen.getByText("Migration")).toBeTruthy();
    expect(screen.getByText("质量检查通知")).toBeTruthy();
    expect(screen.queryByText("任务与质量检查")).toBeNull();
    expect(screen.queryByText("运维状态")).toBeNull();
    expect(screen.queryByText("Detail Drawer")).toBeNull();
    expect(screen.queryByRole("button", { name: "执行真实 Job" })).toBeNull();
    expect(screen.queryByRole("button", { name: "重跑任务" })).toBeNull();
    expect(screen.queryByRole("button", { name: "执行部署" })).toBeNull();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("switches selected operation detail locally and keeps jump actions navigation-only", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <PlatformOperationsPage onNavigate={onNavigate} />
      </AppProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Revenue completeness" }));

    expect(screen.getByText("当前选中对象详情：Revenue completeness")).toBeTruthy();
    expect(screen.getByText("category: data_quality")).toBeTruthy();
    expect(screen.queryByText("当前选中对象详情：nightly-data-quality")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "带上下文进入 Analysis" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("analysis");
    expect(screen.queryByText("真实 conversation")).toBeNull();
    expect(screen.queryByText("真实 run")).toBeNull();
  });
});
