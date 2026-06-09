import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TestProviders } from "../test/TestProviders";
import { ChartCard } from "./ChartCard";

afterEach(cleanup);

describe("ChartCard", () => {
  it("renders title, subtitle, actions, children, and legend inside the shared card surface", () => {
    render(
      <TestProviders>
        <ChartCard
          actions={<button type="button">切换维度</button>}
          legend={<div>图例说明</div>}
          subtitle="最近 30 天"
          title="营收趋势"
        >
          <div>图表内容</div>
        </ChartCard>
      </TestProviders>
    );

    expect(screen.getByText("营收趋势")).toBeTruthy();
    expect(screen.getByText("最近 30 天")).toBeTruthy();
    expect(screen.getByRole("button", { name: "切换维度" })).toBeTruthy();
    expect(screen.getByText("图表内容")).toBeTruthy();
    expect(screen.getByText("图例说明")).toBeTruthy();
  });

  it("renders shared empty state when no chart points are available", () => {
    render(
      <TestProviders>
        <ChartCard
          state={{
            kind: "empty",
            empty: {
              description: "暂无可展示数据",
              title: "当前为空"
            }
          }}
          title="质量趋势"
        />
      </TestProviders>
    );

    expect(screen.getByText("当前为空")).toBeTruthy();
    expect(screen.getByText("暂无可展示数据")).toBeTruthy();
  });
});
