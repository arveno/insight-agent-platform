import { useMemo } from "react";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";
import { Tree, Typography } from "antd";
import type { DataNode } from "antd/es/tree";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { ContextTreeNodeRow } from "../../../shared/ui/lists/ContextTreeNodeRow";
import type { ContextTreeNodeDisplayMap } from "../../../shared/view-model/contextTreeNodeDisplay";
import { renderContextTreeNodeRow } from "../../../shared/view-model/contextTreeNodeDisplay";
import type { AnalysisWorkspaceState } from "../hooks/useAnalysisWorkspaceController";
import type { AnalysisSessionViewModel } from "../models/analysisViewModel";
import type { InspectorSubject } from "../models/inspectorSubject";
import type { AnalysisInspectorRoot, AnalysisInspectorTreeState } from "../models/inspectorTree";
import {
  createDecisionsRootNodeId,
  createEvidenceRootNodeId,
  createReportsRootNodeId,
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

function createRunTraceToolCallOccurrenceNodeId(eventId: string, toolCallId: string): string {
  return `${eventId}:toolCall:${toolCallId}`;
}

function createRunTraceModelCallOccurrenceNodeId(eventId: string, modelCallId: string): string {
  return `${eventId}:modelCall:${modelCallId}`;
}

function createRunTraceEventChildren(args: {
  event: AnalysisSessionViewModel["runEvents"][number];
  modelDetailById: Map<string, AnalysisSessionViewModel["modelDetails"][number]>;
  toolDetailById: Map<string, AnalysisSessionViewModel["toolDetails"][number]>;
}): InspectorTreeNode[] | undefined {
  const { event, modelDetailById, toolDetailById } = args;
  const children: InspectorTreeNode[] = [];

  if (event.refType === "toolCall" && event.refId) {
    const toolDetail = toolDetailById.get(event.refId);

    if (toolDetail) {
      children.push({
        nodeId: createRunTraceToolCallOccurrenceNodeId(event.eventId, toolDetail.toolCallId),
        kind: "toolCall",
        role: "toolCall",
        owner: {
          runId: toolDetail.runId,
          type: "analysisRun"
        },
        sourceRef: {
          type: "toolCall",
          toolCallId: toolDetail.toolCallId
        },
        title: `ToolCall · ${toolDetail.toolName}`,
        value: toolDetail.summary
      });
    }
  }

  if (event.refType === "modelCall" && event.refId) {
    const modelDetail = modelDetailById.get(event.refId);

    if (modelDetail) {
      children.push({
        nodeId: createRunTraceModelCallOccurrenceNodeId(event.eventId, modelDetail.modelCallId),
        kind: "modelCall",
        role: "modelCall",
        owner: {
          runId: modelDetail.runId,
          type: "analysisRun"
        },
        sourceRef: {
          type: "modelCall",
          modelCallId: modelDetail.modelCallId
        },
        title: `ModelCall · ${modelDetail.modelId}`,
        value: `${modelDetail.provider} · ${modelDetail.tokenUsageText} tok · ${modelDetail.latencyText}`
      });
    }
  }

  return children.length > 0 ? children : undefined;
}

function createContextRoot(contextPack: AnalysisTaskContextPack): AnalysisInspectorRoot {
  return {
    key: "context",
    owner: contextPack.root.owner,
    title: contextPack.root.title,
    tree: contextPack.root
  };
}

function createRunTraceRoot(session: AnalysisSessionViewModel): AnalysisInspectorRoot {
  const toolDetailById = new Map(
    session.toolDetails.map((toolDetail) => [toolDetail.toolCallId, toolDetail])
  );
  const modelDetailById = new Map(
    session.modelDetails.map((modelDetail) => [modelDetail.modelCallId, modelDetail])
  );

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
        ),
        children: createRunTraceEventChildren({
          event,
          modelDetailById,
          toolDetailById
        })
      }))
    }
  };
}

function createEvidenceRoot(session: AnalysisSessionViewModel): AnalysisInspectorRoot | null {
  if (session.sourceEvidence.length === 0) {
    return null;
  }

  return {
    key: "evidence",
    owner: {
      runId: session.currentRun.runId,
      type: "analysisRun"
    },
    title: "Evidence",
    tree: {
      nodeId: createEvidenceRootNodeId(session.currentRun.runId),
      kind: "directory",
      role: "directory",
      owner: {
        runId: session.currentRun.runId,
        type: "analysisRun"
      },
      title: "Evidence",
      summary: `${session.sourceEvidence.length} persisted source evidence item(s).`,
      children: session.sourceEvidence.map((item) => ({
        nodeId: item.sourceEvidenceId,
        kind: "sourceEvidence",
        role: "evidenceItem",
        owner: {
          sourceEvidenceId: item.sourceEvidenceId,
          type: "sourceEvidence"
        },
        title: item.title,
        summary: `${item.summary} · ${item.confidenceText}`,
        sourceRef: {
          type: "sourceEvidence",
          sourceEvidenceId: item.sourceEvidenceId
        }
      }))
    }
  };
}

function createReportRoot(session: AnalysisSessionViewModel): AnalysisInspectorRoot | null {
  const reportPreview = session.reportPreview;

  if (!reportPreview) {
    return null;
  }

  return {
    key: "reports",
    owner: {
      runId: session.currentRun.runId,
      type: "analysisRun"
    },
    title: "Report",
    tree: {
      nodeId: createReportsRootNodeId(session.currentRun.runId),
      kind: "directory",
      role: "directory",
      owner: {
        runId: session.currentRun.runId,
        type: "analysisRun"
      },
      title: "Report",
      summary: "Persisted delivery report for the selected AnalysisRun.",
      children: [
        {
          nodeId: reportPreview.reportId,
          kind: "report",
          role: "runOutput",
          owner: {
            reportId: reportPreview.reportId,
            type: "report"
          },
          title: reportPreview.title,
          summary: reportPreview.summary,
          sourceRef: {
            type: "report",
            reportId: reportPreview.reportId
          },
          children: reportPreview.sections.map((section) => ({
            nodeId: section.key,
            kind: "reportSection",
            role: "reportSection",
            owner: {
              reportId: reportPreview.reportId,
              type: "report"
            },
            title: section.title,
            value: section.content
          }))
        }
      ]
    }
  };
}

function createDecisionRoot(session: AnalysisSessionViewModel): AnalysisInspectorRoot | null {
  if (session.decisions.length === 0) {
    return null;
  }

  return {
    key: "decisions",
    owner: {
      runId: session.currentRun.runId,
      type: "analysisRun"
    },
    title: "Decision",
    tree: {
      nodeId: createDecisionsRootNodeId(session.currentRun.runId),
      kind: "directory",
      role: "directory",
      owner: {
        runId: session.currentRun.runId,
        type: "analysisRun"
      },
      title: "Decision",
      summary: "Decision objects persisted for the selected AnalysisRun.",
      children: session.decisions.map((decision) => ({
        nodeId: decision.decisionId,
        kind: "decision",
        role: "decision",
        owner: {
          runId: decision.runId,
          type: "analysisRun"
        },
        title: decision.title,
        summary: decision.createdAtText,
        disabledReason: "当前决策暂无独立来源页。"
      }))
    }
  };
}

export function buildAnalysisInspectorRoots(
  session: AnalysisSessionViewModel
): AnalysisInspectorRoot[] {
  return [
    createRunTraceRoot(session),
    createEvidenceRoot(session),
    createReportRoot(session),
    createDecisionRoot(session),
    session.analysisTaskContextPack ? createContextRoot(session.analysisTaskContextPack) : null
  ].filter((root): root is AnalysisInspectorRoot => root !== null);
}

function resolveInspectorNodeHref(node: InspectorTreeNode): string | null {
  const sourceRef = node.sourceRef;

  if (!sourceRef) {
    return null;
  }

  switch (sourceRef.type) {
    case "sourceEvidence":
      return `/data-knowledge#source-evidence:${sourceRef.sourceEvidenceId}`;
    case "report":
      return `/reports#report:${sourceRef.reportId}`;
    default:
      return null;
  }
}

function renderRuntimeNodeValue(node: InspectorTreeNode) {
  const href = resolveInspectorNodeHref(node);

  if (href) {
    return (
      <Typography.Link
        href={href}
        onClick={(event) => {
          event.stopPropagation();
        }}
        rel="noreferrer"
        target="_blank"
      >
        Open full source
      </Typography.Link>
    );
  }

  if (node.disabledReason) {
    return node.disabledReason;
  }

  return node.value;
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
  const secondaryText = isTraceRoot ? (node.summary ?? node.children?.[0]?.title) : node.summary;

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
        valueText={isTraceRoot ? undefined : renderRuntimeNodeValue(node)}
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
                  : "当前选中项没有可展示的分析详情。",
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
          selectedKeys={
            inspectorTreeState.selectedNodeId ? [inspectorTreeState.selectedNodeId] : []
          }
          treeData={treeData}
        />
      )}
    </SidePanel>
  );
}
