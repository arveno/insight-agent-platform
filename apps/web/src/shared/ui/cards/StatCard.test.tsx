import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TestProviders } from "../../test/TestProviders";
import { StatCard } from "./StatCard";

afterEach(cleanup);

describe("StatCard", () => {
  it("renders supportingMeta through the generic shared meta slot", () => {
    render(
      <TestProviders>
        <StatCard
          risk={{ label: "中风险", level: "medium" }}
          status={{ label: "正常", tone: "success" }}
          supportingMeta="2 条相关上下文"
          title="收入异常"
          trend="环比 +8%"
          value="12.4%"
        />
      </TestProviders>
    );

    expect(screen.getByText("收入异常")).toBeTruthy();
    expect(screen.getByText("12.4%")).toBeTruthy();
    expect(screen.getByText("环比 +8%")).toBeTruthy();
    expect(screen.getByText("2 条相关上下文")).toBeTruthy();
    expect(screen.getByText("正常")).toBeTruthy();
    expect(screen.getByText("中风险")).toBeTruthy();
  });
});
