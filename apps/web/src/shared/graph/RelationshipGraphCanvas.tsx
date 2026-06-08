import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import { Graph, NodeEvent, type GraphOptions } from "@antv/g6";
import {
  AimOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from "@ant-design/icons";
import { Button, Space, Tooltip, Typography, theme } from "antd";

import { shellThemeTokens } from "../theme/tokens";
import { shellTypographyStyles } from "../theme/typography";
import type {
  RelationshipGraphEdgeViewModel,
  RelationshipGraphNodeKind,
  RelationshipGraphViewModel
} from "./models";
import {
  getRelationshipGraphEdgeColors,
  getRelationshipGraphNodeColors
} from "./relationshipGraphTheme";

const defaultGraphHeight = 480;
const defaultGraphWidth = 720;
const graphViewportPadding = 28;
const fitViewOptions = {
  direction: "both",
  when: "always"
} as const;

type NodeClickEvent = {
  target?: {
    id?: string;
  };
};

export type RelationshipGraphCanvasProps = {
  emptyText?: string;
  graph: RelationshipGraphViewModel;
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string;
};

function resolveGraphSize(container: HTMLDivElement) {
  return {
    height: Math.max(container.clientHeight, defaultGraphHeight),
    width: Math.max(container.clientWidth, defaultGraphWidth)
  };
}

function createSelectionStateMap(
  edges: RelationshipGraphEdgeViewModel[],
  nodeIds: string[],
  selectedNodeId?: string
) {
  const stateMap: Record<string, string[]> = {};

  nodeIds.forEach((nodeId) => {
    stateMap[nodeId] = nodeId === selectedNodeId ? ["selected"] : [];
  });

  edges.forEach((edge) => {
    const isConnected =
      edge.sourceNodeId === selectedNodeId || edge.targetNodeId === selectedNodeId;

    stateMap[edge.edgeId] = isConnected ? ["selected"] : [];
  });

  return stateMap;
}

function createGraphOptions(
  graph: RelationshipGraphViewModel,
  isDarkMode: boolean,
  height: number,
  width: number,
  token: ReturnType<typeof theme.useToken>["token"]
): GraphOptions {
  const edgeColors = getRelationshipGraphEdgeColors(isDarkMode);

  return {
    animation: false,
    autoFit: {
      options: fitViewOptions,
      type: "view"
    },
    behaviors: ["drag-canvas", "zoom-canvas"],
    data: {
      edges: graph.edges.map((edge) => ({
        data: {
          label: edge.label
        },
        id: edge.edgeId,
        source: edge.sourceNodeId,
        target: edge.targetNodeId
      })),
      nodes: graph.nodes.map((node) => ({
        data: {
          description: node.description,
          kind: node.kind,
          label: node.label,
          riskText: node.riskText,
          statusText: node.statusText
        },
        id: node.nodeId
      }))
    },
    edge: {
      style: {
        endArrow: true,
        labelBackground: true,
        labelFill: token.colorTextSecondary,
        labelFontSize: 11,
        labelMaxWidth: 180,
        labelText: (datum) => String(datum.data?.label ?? ""),
        lineWidth: 1.5,
        radius: 12,
        stroke: edgeColors.stroke
      },
      state: {
        selected: {
          lineWidth: 2,
          stroke: edgeColors.selectedStroke
        }
      },
      type: "polyline"
    },
    height,
    layout: {
      align: "UL",
      nodesep: 24,
      rankdir: "LR",
      ranksep: 96,
      type: "dagre"
    },
    node: {
      state: {
        selected: {
          lineWidth: 2.5,
          shadowBlur: 18,
          shadowColor: isDarkMode ? "rgba(96, 165, 250, 0.24)" : "rgba(37, 99, 235, 0.18)",
          stroke: edgeColors.selectedStroke
        }
      },
      style: {
        fill: (datum) =>
          getRelationshipGraphNodeColors(
            datum.data?.kind as RelationshipGraphNodeKind,
            isDarkMode
          ).fill,
        labelFill: token.colorText,
        labelFontSize: 13,
        labelFontWeight: 600,
        labelMaxLines: 3,
        labelMaxWidth: "82%",
        labelPlacement: "center",
        labelText: (datum) => String(datum.data?.label ?? ""),
        labelWordWrap: true,
        lineWidth: 1.5,
        padding: [18, 20],
        radius: 16,
        shadowBlur: 10,
        shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.08)",
        size: (datum) => {
          const kind = datum.data?.kind as RelationshipGraphNodeKind;

          if (kind === "usage") {
            return [210, 76];
          }

          if (kind === "empty") {
            return [190, 68];
          }

          return [220, 88];
        },
        stroke: (datum) =>
          getRelationshipGraphNodeColors(
            datum.data?.kind as RelationshipGraphNodeKind,
            isDarkMode
          ).stroke
      },
      type: "rect"
    },
    padding: graphViewportPadding,
    width
  };
}

export function RelationshipGraphCanvas({
  emptyText = "No relationship nodes available",
  graph,
  onSelectNode,
  selectedNodeId
}: RelationshipGraphCanvasProps) {
  const { token, theme: antTheme } = theme.useToken();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const currentSelectedNodeId = selectedNodeId ?? graph.selectedNodeId;
  const nodeIds = useMemo(() => graph.nodes.map((node) => node.nodeId), [graph.nodes]);
  const isDarkMode = antTheme.id === 1;

  const handleSelectNode = useEffectEvent((nodeId: string) => {
    onSelectNode?.(nodeId);
  });
  const fitRelationshipGraphView = useEffectEvent((graphInstance: Graph) => {
    void graphInstance.fitView(fitViewOptions, false).catch(() => undefined);
  });
  const withActiveGraph = useEffectEvent((callback: (graphInstance: Graph) => void) => {
    const graphInstance = graphRef.current;

    if (!graphInstance || graphInstance.destroyed) {
      return;
    }

    callback(graphInstance);
  });

  const applySelectionState = useEffectEvent((graphInstance: Graph) => {
    void graphInstance
      .setElementState(
        createSelectionStateMap(graph.edges, nodeIds, currentSelectedNodeId),
        false
      )
      .catch(() => undefined);
  });

  useEffect(() => {
    if (graph.nodes.length === 0) {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;

      if (graphRef.current && !graphRef.current.destroyed) {
        graphRef.current.destroy();
      }

      graphRef.current = null;

      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (!graphRef.current || graphRef.current.destroyed) {
      const { height, width } = resolveGraphSize(container);
      const graphInstance = new Graph({
        container,
        height,
        width
      });

      graphInstance.on(NodeEvent.CLICK, (event: unknown) => {
        const clickEvent = event as NodeClickEvent;

        if (clickEvent.target?.id) {
          handleSelectNode(clickEvent.target.id);
        }
      });

      graphRef.current = graphInstance;
    }

    const graphInstance = graphRef.current;
    const { height, width } = resolveGraphSize(container);

    graphInstance.setOptions(
      createGraphOptions(graph, isDarkMode, height, width, token)
    );

    let cancelled = false;

    void graphInstance.render().then(() => {
      if (cancelled) {
        return;
      }

      void graphInstance.fitView(fitViewOptions, false).finally(() => {
        if (!cancelled) {
          applySelectionState(graphInstance);
        }
      });
    });

    if (!resizeObserverRef.current && "ResizeObserver" in window) {
      resizeObserverRef.current = new ResizeObserver(() => {
        const currentContainer = containerRef.current;
        const currentGraph = graphRef.current;

        if (!currentContainer || !currentGraph || currentGraph.destroyed) {
          return;
        }

        const nextSize = resolveGraphSize(currentContainer);
        currentGraph.resize(nextSize.width, nextSize.height);
        fitRelationshipGraphView(currentGraph);
      });
      resizeObserverRef.current.observe(container);
    }

    return () => {
      cancelled = true;
    };
  }, [applySelectionState, fitRelationshipGraphView, graph, handleSelectNode, isDarkMode, token]);

  useEffect(() => {
    const graphInstance = graphRef.current;

    if (!graphInstance || graphInstance.destroyed || graph.nodes.length === 0) {
      return;
    }

    applySelectionState(graphInstance);
  }, [applySelectionState, currentSelectedNodeId, graph.edges, graph.nodes.length, nodeIds]);

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;

      if (graphRef.current && !graphRef.current.destroyed) {
        graphRef.current.destroy();
      }

      graphRef.current = null;
    };
  }, []);

  if (graph.nodes.length === 0) {
    return (
      <Space
        align="center"
        direction="vertical"
        style={{
          background: token.colorBgLayout,
          border: `${shellThemeTokens.surfaceBorderWidth}px dashed ${token.colorBorderSecondary}`,
          borderRadius: shellThemeTokens.borderRadiusLG,
          justifyContent: "center",
          minHeight: defaultGraphHeight,
          padding: token.paddingLG,
          width: "100%"
        }}
      >
        <Typography.Text style={shellTypographyStyles.cardTitle}>{graph.title}</Typography.Text>
        {graph.description ? (
          <Typography.Text
            style={{ ...shellTypographyStyles.cardDescription, color: token.colorTextDescription }}
          >
            {graph.description}
          </Typography.Text>
        ) : null}
        <Typography.Text type="secondary">{emptyText}</Typography.Text>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      {graph.description ? (
        <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
          {graph.description}
        </Typography.Text>
      ) : null}
      <div style={{ position: "relative", width: "100%" }}>
        <Space
          size={8}
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            zIndex: 1
          }}
        >
          <Tooltip title="Zoom out">
            <Button
              aria-label="Zoom out"
              icon={<ZoomOutOutlined />}
              onClick={() => {
                withActiveGraph((graphInstance) => {
                  void graphInstance.zoomBy(0.8, false).catch(() => undefined);
                });
              }}
              shape="circle"
              size="small"
              type="default"
            />
          </Tooltip>
          <Tooltip title="Reset view">
            <Button
              aria-label="Reset view"
              icon={<AimOutlined />}
              onClick={() => {
                withActiveGraph((graphInstance) => {
                  fitRelationshipGraphView(graphInstance);
                });
              }}
              shape="circle"
              size="small"
              type="default"
            />
          </Tooltip>
          <Tooltip title="Zoom in">
            <Button
              aria-label="Zoom in"
              icon={<ZoomInOutlined />}
              onClick={() => {
                withActiveGraph((graphInstance) => {
                  void graphInstance.zoomBy(1.2, false).catch(() => undefined);
                });
              }}
              shape="circle"
              size="small"
              type="default"
            />
          </Tooltip>
        </Space>
        <div
          aria-label={graph.title}
          ref={containerRef}
          style={{
            background: token.colorBgContainer,
            border: `${shellThemeTokens.surfaceBorderWidth}px solid ${token.colorBorderSecondary}`,
            borderRadius: shellThemeTokens.borderRadiusLG,
            height: defaultGraphHeight,
            overflow: "hidden",
            width: "100%"
          }}
        />
      </div>
    </Space>
  );
}
