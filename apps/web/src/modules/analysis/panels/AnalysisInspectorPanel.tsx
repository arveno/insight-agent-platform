import { useMemo } from "react";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";
import { Space, Tag, Tree, Typography } from "antd";
import type { DataNode } from "antd/es/tree";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { ContextTreeNodeRow } from "../../../shared/ui/lists/ContextTreeNodeRow";
import { CardSurface } from "../../../shared/ui/surfaces/CardSurface";
import { normalizeContextSourceChipLabel } from "../../../shared/view-model/contextSourceDisplay";
import type { ContextTreeNodeDisplayMap } from "../../../shared/view-model/contextTreeNodeDisplay";
import { renderContextTreeNodeRow } from "../../../shared/view-model/contextTreeNodeDisplay";
import type { AnalysisWorkspaceState } from "../hooks/useAnalysisWorkspaceController";
import type { AnalysisSessionViewModel } from "../models/analysisViewModel";
import type { InspectorSubject } from "../models/inspectorSubject";
import type {
  AnalysisInspectorRoot,
  AnalysisInspectorTreeState
} from "../models/inspectorTree";
import {
  createContextRootNodeId,
  createRunTraceRootNodeId,
  findInspectorTreePathNodes
} from "../models/inspectorTree";
import type { AnalysisTaskContextPack } from "../models/runtimeContractTypes";
import {
  buildInspectorNodePresentation,
  getInspectorPresentationTitle
} from "./inspector/buildInspectorNodePresentation";

export type AnalysisInspectorPanelProps = {
  contextPanelNote: string;
  contextNodeDisplay?: ContextTreeNodeDisplayMap;
  draftContext?: AnalysisTaskContextPack;
  inspectorTreeState: AnalysisInspectorTreeState;
  onSetInspectorExpandedNodeIds: (nodeIds: string[]) => void;
  onSelectInspectorNode: (nodeId: string) => void;
  selectedInspectorSubject?: InspectorSubject;
  selectedSession?: AnalysisSessionViewModel;
  workspaceState: AnalysisWorkspaceState;
};

function createRequestContextRoot(args: {
  analysisTaskId: string;
  contextPack: AnalysisTaskContextPack;
}): AnalysisInspectorRoot {
  return {
    key: "context",
    owner: args.contextPack.root.owner,
    title: "Request Context",
    tree: {
      nodeId: createContextRootNodeId(args.analysisTaskId),
      kind: "directory",
      role: "directory",
      owner: args.contextPack.root.owner,
      title: "Request Context",
      summary: args.contextPack.root.summary,
      chips: args.contextPack.root.timeRange ? [args.contextPack.root.timeRange.label] : undefined,
      children: [args.contextPack.root]
    }
  };
}

function createRunTraceRoot(session: AnalysisSessionViewModel): AnalysisInspectorRoot {
  return {
    key: "run-trace",
    owner: {
      runId: session.currentRun.runId,
      type: "analysisRun"
    },
    title: "Run Trace",
    tree: {
      nodeId: createRunTraceRootNodeId(session.currentRun.runId),
      kind: "directory",
      role: "directory",
      owner: {
        runId: session.currentRun.runId,
        type: "analysisRun"
      },
      title: "Run Trace",
      summary: session.currentRun.stageSummary,
      chips: [session.currentRun.status, session.currentRun.phase],
      children: session.runEvents.map((event) => ({
        nodeId: event.eventId,
        kind: "traceEvent",
        role: "traceEvent",
        owner: {
          runId: event.runId,
          type: "analysisRun"
        },
        title: event.eventType,
        summary: event.summary,
        description: event.detail,
        value: event.timestampText,
        chips: [event.status, event.durationText, event.toolName, event.modelName].filter(
          (value): value is string => Boolean(value)
        )
      }))
    }
  };
}

export function buildAnalysisInspectorRoots(
  session: AnalysisSessionViewModel
): AnalysisInspectorRoot[] {
  return [
    createRunTraceRoot(session),
    ...(session.analysisTaskContextPack
      ? [
          createRequestContextRoot({
            analysisTaskId: session.analysisTaskId,
            contextPack: session.analysisTaskContextPack
          })
        ]
      : [])
  ];
}

function buildTreeData(args: {
  activeNodeId: string | null;
  contextNodeDisplay?: ContextTreeNodeDisplayMap;
  contextRootNodeId?: string;
  node: InspectorTreeNode;
  rootKey: AnalysisInspectorRoot["key"];
  t: ReturnType<typeof useI18n>["t"];
}): DataNode {
  const { activeNodeId, contextNodeDisplay, contextRootNodeId, node, rootKey, t } = args;
  const isContextNode = rootKey === "context" && node.nodeId !== contextRootNodeId;
  const isTraceRoot = rootKey === "run-trace" && node.kind === "directory";
  const secondaryText =
    isTraceRoot || node.nodeId === contextRootNodeId ? node.summary ?? node.children?.[0]?.title : undefined;

  return {
    children: node.children?.map((child) =>
      buildTreeData({
        activeNodeId,
        contextNodeDisplay,
        contextRootNodeId,
        node: child,
        rootKey,
        t
      })
    ),
    key: node.nodeId,
    title: isContextNode ? (
      renderContextTreeNodeRow({
        activeNodeId: activeNodeId ?? node.nodeId,
        node,
        nodeDisplay: contextNodeDisplay,
        t
      })
    ) : (
      <ContextTreeNodeRow
        count={node.children?.length}
        secondaryText={secondaryText}
        selected={activeNodeId === node.nodeId}
        title={node.title}
        valueText={isTraceRoot ? undefined : node.value}
      />
    )
  };
}

function findSelectedPath(
  roots: AnalysisInspectorRoot[],
  selectedNodeId: string | null
): InspectorTreeNode[] | null {
  if (roots.length === 0) {
    return null;
  }

  if (selectedNodeId) {
    for (const root of roots) {
      const path = findInspectorTreePathNodes(root.tree, selectedNodeId);

      if (path) {
        return path;
      }
    }
  }

  return [roots[0]!.tree];
}

function renderChipList(args: {
  chips: string[];
  t: ReturnType<typeof useI18n>["t"];
}) {
  const chips = args.chips.map((chip) => normalizeContextSourceChipLabel(args.t, chip) ?? chip);

  if (chips.length === 0) {
    return null;
  }

  return (
    <Space size={[8, 8]} wrap>
      {chips.map((chip) => (
        <Tag key={chip}>{chip}</Tag>
      ))}
    </Space>
  );
}

export function AnalysisInspectorPanel({
  contextPanelNote,
  contextNodeDisplay,
  draftContext,
  inspectorTreeState,
  onSetInspectorExpandedNodeIds,
  onSelectInspectorNode,
  selectedInspectorSubject,
  selectedSession,
  workspaceState
}: AnalysisInspectorPanelProps) {
  const { t } = useI18n();
  const roots = useMemo(
    () =>
      selectedSession
        ? buildAnalysisInspectorRoots(selectedSession)
        : draftContext
          ? [
              createRequestContextRoot({
                analysisTaskId: "draft",
                contextPack: draftContext
              })
            ]
          : [],
    [draftContext, selectedSession]
  );
  const selectedPathNodes = useMemo(
    () => findSelectedPath(roots, inspectorTreeState.selectedNodeId),
    [inspectorTreeState.selectedNodeId, roots]
  );
  const selectedNode = selectedPathNodes?.at(-1) ?? null;
  const selectedNodePresentation = selectedNode
    ? buildInspectorNodePresentation(selectedNode, selectedPathNodes?.slice(0, -1) ?? [])
    : null;
  const treeData = useMemo(
    () =>
      roots.map((root) =>
        buildTreeData({
          activeNodeId: selectedNode?.nodeId ?? null,
          contextNodeDisplay,
          contextRootNodeId: root.key === "context" ? root.tree.nodeId : undefined,
          node: root.tree,
          rootKey: root.key,
          t
        })
      ),
    [contextNodeDisplay, roots, selectedNode?.nodeId, t]
  );

  return (
    <SidePanel
      description={contextPanelNote}
      empty={
        workspaceState.kind === "draft"
          ? {
              description: "当前还没有附带上下文，可直接输入问题或从其他入口带入。",
              title: "分析详情"
            }
          : {
              description:
                selectedInspectorSubject?.type === "analysisTask"
                  ? "当前分析请求没有可展示的上下文树。"
                  : "当前消息没有可展示的分析详情。",
              title: "分析详情"
            }
      }
      title="分析详情"
    >
      {roots.length === 0 ? null : (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Tree
            aria-label="Analysis inspector tree"
            blockNode
            expandedKeys={inspectorTreeState.expandedNodeIds}
            onExpand={(keys) => onSetInspectorExpandedNodeIds(keys.map((key) => String(key)))}
            onSelect={(selectedKeys) => {
              const nodeId = selectedKeys[0];

              if (nodeId) {
                onSelectInspectorNode(String(nodeId));
              }
            }}
            selectedKeys={selectedNode ? [selectedNode.nodeId] : []}
            treeData={treeData}
          />

          {selectedNodePresentation ? (
            <CardSurface>
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {selectedNodePresentation.eyebrow ? (
                  <Typography.Text type="secondary">
                    {selectedNodePresentation.eyebrow}
                  </Typography.Text>
                ) : null}
                <Typography.Text strong>
                  {getInspectorPresentationTitle(selectedNodePresentation, {
                    includeChildCount: selectedNode?.kind === "directory"
                  })}
                </Typography.Text>
                {selectedNodePresentation.value ? (
                  <Typography.Text>{selectedNodePresentation.value}</Typography.Text>
                ) : null}
                {selectedNodePresentation.description ? (
                  <Typography.Paragraph style={{ margin: 0 }}>
                    {selectedNodePresentation.description}
                  </Typography.Paragraph>
                ) : null}
                {selectedNodePresentation.hasChildren ? (
                  <Typography.Text type="secondary">
                    {`包含 ${selectedNodePresentation.childCount} 个子节点`}
                  </Typography.Text>
                ) : null}
                {renderChipList({
                  chips: selectedNodePresentation.chips,
                  t
                })}
                {selectedNodePresentation.disabledReason ? (
                  <Typography.Text type="secondary">
                    {selectedNodePresentation.disabledReason}
                  </Typography.Text>
                ) : null}
              </Space>
            </CardSurface>
          ) : null}
        </Space>
      )}
    </SidePanel>
  );
}
