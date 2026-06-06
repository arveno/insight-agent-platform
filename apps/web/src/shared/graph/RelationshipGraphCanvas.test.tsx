import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { RelationshipGraphCanvas } from "./RelationshipGraphCanvas";
import type { RelationshipGraphViewModel } from "./models";

const {
  GraphMock,
  graphDestroy,
  graphGetSize,
  graphOn,
  graphRender,
  graphResize,
  graphSetElementState,
  graphSetOptions
} = vi.hoisted(() => {
  const hoistedGraphDestroy = vi.fn();
  const hoistedGraphOn = vi.fn();
  const hoistedGraphRender = vi.fn().mockResolvedValue(undefined);
  const hoistedGraphResize = vi.fn();
  const hoistedGraphSetElementState = vi.fn().mockResolvedValue(undefined);
  const hoistedGraphSetOptions = vi.fn();
  const hoistedGraphGetSize = vi.fn(() => [720, 480] as const);
  const hoistedGraphMock = vi.fn().mockImplementation(() => ({
    destroy: hoistedGraphDestroy,
    destroyed: false,
    getSize: hoistedGraphGetSize,
    on: hoistedGraphOn,
    render: hoistedGraphRender,
    resize: hoistedGraphResize,
    setElementState: hoistedGraphSetElementState,
    setOptions: hoistedGraphSetOptions
  }));

  return {
    GraphMock: hoistedGraphMock,
    graphDestroy: hoistedGraphDestroy,
    graphGetSize: hoistedGraphGetSize,
    graphOn: hoistedGraphOn,
    graphRender: hoistedGraphRender,
    graphResize: hoistedGraphResize,
    graphSetElementState: hoistedGraphSetElementState,
    graphSetOptions: hoistedGraphSetOptions
  };
});

vi.mock("@antv/g6", () => ({
  Graph: GraphMock,
  NodeEvent: {
    CLICK: "node:click"
  }
}));

afterEach(() => {
  cleanup();
  GraphMock.mockClear();
  graphDestroy.mockClear();
  graphGetSize.mockClear();
  graphOn.mockClear();
  graphRender.mockClear();
  graphResize.mockClear();
  graphSetElementState.mockClear();
  graphSetOptions.mockClear();
});

beforeAll(() => {
  Object.defineProperty(window, "ResizeObserver", {
    configurable: true,
    value: class ResizeObserver {
      observe() {
        return undefined;
      }

      disconnect() {
        return undefined;
      }
    }
  });
});

function createGraphViewModel(): RelationshipGraphViewModel {
  return {
    description: "DataSource -> DataTable -> DataField -> SourceEvidence -> Run / Report",
    edges: [
      {
        edgeId: "edge-field-evidence",
        sourceNodeId: "field-1",
        targetNodeId: "evidence-1"
      }
    ],
    nodes: [
      {
        description: "字段节点",
        kind: "field",
        label: "recognized_revenue",
        nodeId: "field-1"
      },
      {
        description: "证据节点",
        kind: "evidence",
        label: "sales_order 收入确认快照",
        nodeId: "evidence-1"
      }
    ],
    selectedNodeId: "field-1",
    title: "Asset relationship graph"
  };
}

describe("RelationshipGraphCanvas", () => {
  it("renders an empty state without creating a G6 graph when there are no nodes", () => {
    render(
      <AppProviders>
        <RelationshipGraphCanvas
          emptyText="No relationship nodes"
          graph={{
            description: "empty graph",
            edges: [],
            nodes: [],
            title: "Asset relationship graph"
          }}
        />
      </AppProviders>
    );

    expect(screen.getByText("No relationship nodes")).toBeTruthy();
    expect(GraphMock).not.toHaveBeenCalled();
  });

  it("creates, updates and destroys the G6 graph while forwarding node clicks", async () => {
    const onSelectNode = vi.fn();

    const { unmount } = render(
      <AppProviders>
        <RelationshipGraphCanvas
          graph={createGraphViewModel()}
          onSelectNode={onSelectNode}
          selectedNodeId="field-1"
        />
      </AppProviders>
    );

    expect(GraphMock).toHaveBeenCalledTimes(1);
    expect(graphSetOptions).toHaveBeenCalledTimes(1);
    expect(graphRender).toHaveBeenCalledTimes(1);

    const clickHandler = graphOn.mock.calls.find(([eventName]) => eventName === "node:click")?.[1];
    expect(clickHandler).toBeTypeOf("function");

    clickHandler?.({ target: { id: "evidence-1" } });

    expect(onSelectNode).toHaveBeenCalledWith("evidence-1");

    unmount();

    expect(graphDestroy).toHaveBeenCalledTimes(1);
  });
});
