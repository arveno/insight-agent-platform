import { useMemo } from "react";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";
import { Tree } from "antd";
import type { DataNode } from "antd/es/tree";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { ContextTreeNodeRow } from "../../../shared/ui/lists/ContextTreeNodeRow";
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
  createRunTraceRootNodeId
} from "../models/inspectorTree";
import type { AnalysisTaskContextPack } from "../models/runtimeContractTypes";

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

function createContextRoot(contextPack: AnalysisTaskContextPack): AnalysisInspectorRoot {
  return {
    key: "context",
    owner: contextPack.root.owner,
    title: contextPack.root.title,
    tree: contextPack.root
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
    ...(session.analysisTaskContextPack ? [createContextRoot(session.analysisTaskContextPack)] : [])
  ];
}

function buildTreeData(args: {
  activeNodeId: string | null;
  contextNodeDisplay?: ContextTreeNodeDisplayMap;
  node: InspectorTreeNode;
  rootKey: AnalysisInspectorRoot["key"];
  t: ReturnType<typeof useI18n>["t"];
}): DataNode {
  const { activeNodeId, contextNodeDisplay, node, rootKey, t } = args;
  const isContextNode = rootKey === "context";
  const isTraceRoot = rootKey === "run-trace" && node.kind === "directory";
  const secondaryText = isTraceRoot ? node.summary ?? node.children?.[0]?.title : undefined;

  return {
    children: node.children?.map((child) =>
        buildTreeData({
          activeNodeId,
          contextNodeDisplay,
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
          ? [createContextRoot(draftContext)]
          : [],
    [draftContext, selectedSession]
  );
  const treeData = useMemo(
    () =>
      roots.map((root) =>
        buildTreeData({
          activeNodeId: inspectorTreeState.selectedNodeId,
          contextNodeDisplay,
          node: root.tree,
          rootKey: root.key,
          t
        })
      ),
    [contextNodeDisplay, inspectorTreeState.selectedNodeId, roots, t]
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
          selectedKeys={inspectorTreeState.selectedNodeId ? [inspectorTreeState.selectedNodeId] : []}
          treeData={treeData}
        />
      )}
    </SidePanel>
  );
}
