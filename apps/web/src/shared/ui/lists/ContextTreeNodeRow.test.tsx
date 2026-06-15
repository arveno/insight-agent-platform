import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TestProviders } from "../../test/TestProviders";
import { ContextTreeNodeRow } from "./ContextTreeNodeRow";

afterEach(cleanup);

describe("ContextTreeNodeRow", () => {
  it("renders a standardized compact tree row without depending on business objects", () => {
    render(
      <TestProviders>
        <ContextTreeNodeRow
          badges={<span>中风险</span>}
          count={4}
          secondaryText="¥12.8M · 下降 3.2%"
          selected
          title="确认收入"
        />
      </TestProviders>
    );

    expect(screen.getByText("确认收入")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("¥12.8M · 下降 3.2%")).toBeTruthy();
    expect(screen.getByText("中风险")).toBeTruthy();
    expect(screen.getByText("确认收入").closest("[data-context-tree-row-state='selected']")).toBeTruthy();
  });
});
