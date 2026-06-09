import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";
import { GroupedSelectableList } from "./GroupedSelectableList";

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

describe("GroupedSelectableList", () => {
  it("renders grouped items while keeping group headers non-clickable", () => {
    const onSelect = vi.fn();

    render(
      <TestProviders>
        <GroupedSelectableList
          ariaLabel="Grouped navigation"
          groups={[
            {
              items: [{ key: "data-source", title: "CRM Revenue Warehouse" }],
              key: "data",
              title: "数据资产 Data"
            },
            {
              items: [{ key: "document", title: "Finance Knowledge Base" }],
              key: "docs",
              title: "知识文档 Docs"
            }
          ]}
          onSelect={onSelect}
          selectedKey="data-source"
          title="数据与知识资产"
        />
      </TestProviders>
    );

    const navigation = screen.getByRole("navigation", { name: "Grouped navigation" });

    expect(within(navigation).getByText("数据资产 Data")).toBeTruthy();
    expect(within(navigation).getByText("知识文档 Docs")).toBeTruthy();
    expect(within(navigation).queryByRole("button", { name: "数据资产 Data" })).toBeNull();

    fireEvent.click(within(navigation).getByRole("button", { name: "Finance Knowledge Base" }));

    expect(onSelect).toHaveBeenCalledWith("document");
  });

  it("hides empty groups and falls back to empty text when every group is empty", () => {
    const { rerender } = render(
      <TestProviders>
        <GroupedSelectableList
          ariaLabel="Grouped navigation"
          groups={[
            {
              items: [],
              key: "data",
              title: "数据资产 Data"
            },
            {
              items: [{ key: "document", title: "Finance Knowledge Base" }],
              key: "docs",
              title: "知识文档 Docs"
            }
          ]}
          title="数据与知识资产"
        />
      </TestProviders>
    );

    expect(screen.queryByText("数据资产 Data")).toBeNull();
    expect(screen.getByText("知识文档 Docs")).toBeTruthy();

    rerender(
      <TestProviders>
        <GroupedSelectableList
          ariaLabel="Grouped navigation"
          emptyText="暂无匹配资产"
          groups={[
            {
              items: [],
              key: "data",
              title: "数据资产 Data"
            },
            {
              items: [],
              key: "docs",
              title: "知识文档 Docs"
            }
          ]}
          title="数据与知识资产"
        />
      </TestProviders>
    );

    expect(screen.getByText("暂无匹配资产")).toBeTruthy();
  });
});
