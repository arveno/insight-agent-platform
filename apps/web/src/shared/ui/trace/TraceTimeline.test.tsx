import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppProviders } from "../../../app/providers/AppProviders";
import { TraceTimeline } from "./TraceTimeline";

afterEach(cleanup);

describe("TraceTimeline", () => {
  it("uses status only for dot tone while keeping risk badges visible", () => {
    const { container } = render(
      <AppProviders>
        <TraceTimeline
          items={[
            {
              key: "trace-success",
              risk: { label: "中风险", level: "medium" },
              status: { label: "成功", tone: "success" },
              timestampText: "11:08",
              title: "接收用户问题"
            },
            {
              key: "trace-processing",
              status: { label: "加载中", tone: "processing" },
              timestampText: "11:09",
              title: "生成分析计划"
            },
            {
              key: "trace-warning",
              status: { label: "警告", tone: "warning" },
              timestampText: "11:10",
              title: "检查工具权限"
            },
            {
              key: "trace-error",
              status: { label: "失败", tone: "error" },
              timestampText: "11:11",
              title: "生成分析摘要"
            },
            {
              key: "trace-default",
              status: { label: "已取消", tone: "default" },
              timestampText: "11:12",
              title: "等待用户追问"
            }
          ]}
        />
      </AppProviders>
    );

    expect(screen.queryByText("成功")).toBeNull();
    expect(screen.queryByText("加载中")).toBeNull();
    expect(screen.queryByText("警告")).toBeNull();
    expect(screen.queryByText("失败")).toBeNull();
    expect(screen.getByText("中风险")).toBeTruthy();

    const dots = Array.from(container.querySelectorAll("[data-trace-status-dot]"));
    expect(dots).toHaveLength(5);
    expect(dots.map((dot) => dot.getAttribute("data-trace-status-dot"))).toEqual([
      "success",
      "processing",
      "warning",
      "error",
      "default"
    ]);
  });
});
