import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";
import type { ReactNode } from "react";
import { Tag } from "antd";

import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import type { AnalysisWorkspaceState } from "../hooks/useAnalysisWorkspaceController";
import type { AnalysisSessionViewModel } from "../models/analysisViewModel";
import type { InspectorSubject } from "../models/inspectorSubject";
import type {
  AnalysisInspectorRoot,
  AnalysisInspectorRootKey,
  AnalysisInspectorTreeState
} from "../models/inspectorTree";
import {
  createContextRootNodeId,
  createEvidenceRootNodeId,
  createModelCallsRootNodeId,
  createReportsRootNodeId,
  createRunHistoryRootNodeId,
  createRunTraceRootNodeId,
  createToolCallsRootNodeId,
  findInspectorTreePathNodes
} from "../models/inspectorTree";
import type { AnalysisTaskContextPack } from "../models/runtimeContractTypes";
import { AnalysisContextTreeViewport } from "./inspector/AnalysisContextTreeViewport";
import { InspectorRootPanel } from "./inspector/InspectorRootPanel";
import { InspectorTreeNodePanel } from "./inspector/InspectorTreeNodePanel";
import {
  buildInspectorNodePresentation,
  getInspectorPresentationTitle
} from "./inspector/buildInspectorNodePresentation";

export type AnalysisInspectorPanelProps = {
  contextPanelNote: string;
  draftContext?: AnalysisTaskContextPack;
  inspectorTreeState: AnalysisInspectorTreeState;
  onPopInspectorPath: () => void;
  onSelectInspectorNode: (nodeId: string) => void;
  onSelectInspectorRoot: (rootKey: AnalysisInspectorRootKey) => void;
  selectedInspectorSubject?: InspectorSubject;
  selectedSession?: AnalysisSessionViewModel;
  workspaceState: AnalysisWorkspaceState;
};

function createEmptyContextRoot(session: AnalysisSessionViewModel): InspectorTreeNode {
  return {
    nodeId: createContextRootNodeId(session.analysisTaskId),
    kind: "contextRoot",
    role: "inputContext",
    owner: {
      analysisTaskId: session.analysisTaskId,
      type: "analysisTask"
    },
    title: "本次请求上下文",
    summary: "当前请求没有附带上下文。",
    disabledReason: "当前没有可展开的上下文详情。"
  };
}

function getContextRoot(session: AnalysisSessionViewModel): InspectorTreeNode {
  return session.analysisTaskContextPack?.root ?? createEmptyContextRoot(session);
}

function getInspectorRootsViewTitle(
  draftContext: AnalysisTaskContextPack | undefined,
  selectedSubject: InspectorSubject | undefined
): string {
  if (draftContext) {
    return "分析详情";
  }

  if (selectedSubject?.type === "analysisRun") {
    return "本次运行";
  }

  if (selectedSubject?.type === "analysisTask") {
    return "本次分析请求";
  }

  return "分析详情";
}

function createContextViewportBoundaryTags(args: {
  draftContext?: AnalysisTaskContextPack;
  selectedSession?: AnalysisSessionViewModel;
  selectedSubject?: InspectorSubject;
}): ReactNode {
  const root = args.selectedSession?.analysisTaskContextPack?.root ?? args.draftContext?.root;
  const tags = [
    root?.timeRange?.label,
    args.selectedSession
      ? args.selectedSubject?.type === "analysisTask"
        ? "分析请求上下文"
        : "当前运行上下文"
      : "草稿上下文"
  ].filter(Boolean) as string[];

  return (
    <span style={{ columnGap: 8, display: "inline-flex", flexWrap: "wrap", rowGap: 8 }}>
      {tags.map((tag) => (
        <Tag bordered={false} key={tag}>
          {tag}
        </Tag>
      ))}
    </span>
  );
}

function createRunTraceRoot(session: AnalysisSessionViewModel): InspectorTreeNode {
  return {
    nodeId: createRunTraceRootNodeId(session.currentRun.runId),
    kind: "runTraceRoot",
    role: "traceEvent",
    owner: {
      runId: session.currentRun.runId,
      type: "analysisRun"
    },
    title: "Run Trace",
    summary: session.currentRun.stageSummary,
    children: session.runEvents.map((event) => ({
      nodeId: event.eventId,
      kind: "traceEvent",
      role: "traceEvent",
      owner: {
        runId: event.runId,
        type: "analysisRun"
      },
      title: event.title,
      summary: event.summary,
      value: event.timestampText,
      chips: [event.status]
    }))
  };
}

function createRunHistoryRoot(session: AnalysisSessionViewModel): InspectorTreeNode {
  return {
    nodeId: createRunHistoryRootNodeId(session.analysisTaskId),
    kind: "runHistoryRoot",
    role: "directory",
    owner: {
      analysisTaskId: session.analysisTaskId,
      type: "analysisTask"
    },
    title: "运行记录",
    summary: "AnalysisTask 之下的执行实例列表。",
    children: [
      {
        nodeId: session.currentRun.runId,
        kind: "analysisRun",
        role: "runOutput",
        owner: {
          runId: session.currentRun.runId,
          type: "analysisRun"
        },
        title: session.currentRun.runId,
        summary: session.currentRun.stageSummary,
        value: `${session.currentRun.status} · ${session.currentRun.updatedAtText}`,
        sourceRef: {
          runId: session.currentRun.runId,
          type: "analysisRun"
        }
      }
    ]
  };
}

function createCollectionRoot(args: {
  kind: "evidence" | "reports" | "tool-calls" | "model-calls";
  nodes: InspectorTreeNode[];
  runId: string;
  summary: string;
  title: string;
}): InspectorTreeNode {
  const nodeIdByKind: Record<typeof args.kind, string> = {
    "evidence": createEvidenceRootNodeId(args.runId),
    "model-calls": createModelCallsRootNodeId(args.runId),
    "reports": createReportsRootNodeId(args.runId),
    "tool-calls": createToolCallsRootNodeId(args.runId)
  };

  return {
    nodeId: nodeIdByKind[args.kind as keyof typeof nodeIdByKind],
    kind: args.kind,
    role: "directory",
    owner: {
      runId: args.runId,
      type: "analysisRun"
    },
    title: args.title,
    summary: args.summary,
    children: args.nodes
  };
}

export function buildAnalysisInspectorRoots(
  session: AnalysisSessionViewModel,
  subject: InspectorSubject | undefined
): AnalysisInspectorRoot[] {
  const contextRoot = getContextRoot(session);
  const runTraceRoot = createRunTraceRoot(session);
  const reportRoot = createCollectionRoot({
    kind: "reports",
    nodes: session.reportPreview
      ? [
          {
            nodeId: session.reportPreview.reportId,
            kind: "report",
            role: "runOutput",
            owner: {
              runId: session.reportPreview.runId,
              type: "analysisRun"
            },
            title: session.reportPreview.title,
            summary: session.reportPreview.summary,
            sourceRef: {
              reportId: session.reportPreview.reportId,
              type: "report"
            },
            children: session.reportPreview.sections.map((section) => ({
              nodeId: section.key,
              kind: "reportSection",
              role: "reportSection",
              owner: {
                reportId: session.reportPreview!.reportId,
                type: "report"
              },
              title: section.title,
              summary: section.content
            }))
          }
        ]
      : [],
    runId: session.currentRun.runId,
    summary: "本次运行产出的报告对象。",
    title: "输出报告"
  });
  const evidenceRoot = createCollectionRoot({
    kind: "evidence",
    nodes: session.sourceEvidence.map((item) => ({
      nodeId: item.sourceEvidenceId,
      kind: "sourceEvidence",
      role: "evidenceItem",
      owner: {
        runId: item.runId,
        type: "analysisRun"
      },
      title: item.title,
      summary: item.summary,
      chips: [item.confidenceText],
      sourceRef: {
        sourceEvidenceId: item.sourceEvidenceId,
        type: "sourceEvidence"
      }
    })),
    runId: session.currentRun.runId,
    summary: "本次运行绑定的证据项。",
    title: "生成证据"
  });
  const toolRoot = createCollectionRoot({
    kind: "tool-calls",
    nodes: session.toolDetails.map((item) => ({
      nodeId: item.toolCallId,
      kind: "toolCall",
      role: "toolCall",
      owner: {
        runId: item.runId,
        type: "analysisRun"
      },
      title: item.toolName,
      summary: item.summary,
      sourceRef: {
        toolCallId: item.toolCallId,
        type: "toolCall"
      }
    })),
    runId: session.currentRun.runId,
    summary: "本次运行的工具调用。",
    title: "Tool Call"
  });
  const modelRoot = createCollectionRoot({
    kind: "model-calls",
    nodes: session.modelDetails.map((item) => ({
      nodeId: item.modelCallId,
      kind: "modelCall",
      role: "modelCall",
      owner: {
        runId: item.runId,
        type: "analysisRun"
      },
      title: item.modelId,
      summary: `${item.provider} · ${item.latencyText} · ${item.costText}`,
      value: item.tokenUsageText,
      sourceRef: {
        modelCallId: item.modelCallId,
        type: "modelCall"
      }
    })),
    runId: session.currentRun.runId,
    summary: "本次运行的模型调用。",
    title: "Model Call"
  });
  const runHistoryRoot = createRunHistoryRoot(session);

  if (subject?.type === "analysisTask") {
    return [
      {
        key: "context",
        owner: contextRoot.owner,
        title: contextRoot.title,
        tree: contextRoot
      },
      {
        key: "run-history",
        owner: runHistoryRoot.owner,
        title: "运行记录",
        tree: runHistoryRoot
      }
    ];
  }

  return [
    {
      key: "run-trace",
      owner: runTraceRoot.owner,
      title: "Run Trace",
      tree: runTraceRoot
    },
    {
      key: "context",
      owner: contextRoot.owner,
      title: contextRoot.title,
      tree: contextRoot
    },
    ...(session.sourceEvidence.length > 0
      ? [{ key: "evidence" as const, owner: evidenceRoot.owner, title: "生成证据", tree: evidenceRoot }]
      : []),
    ...(session.reportPreview
      ? [{ key: "reports" as const, owner: reportRoot.owner, title: "输出报告", tree: reportRoot }]
      : []),
    ...(session.toolDetails.length > 0
      ? [{ key: "tool-calls" as const, owner: toolRoot.owner, title: "Tool Call", tree: toolRoot }]
      : []),
    ...(session.modelDetails.length > 0
      ? [{ key: "model-calls" as const, owner: modelRoot.owner, title: "Model Call", tree: modelRoot }]
      : [])
  ];
}

export function AnalysisInspectorPanel({
  contextPanelNote,
  draftContext,
  inspectorTreeState,
  onPopInspectorPath,
  onSelectInspectorNode,
  onSelectInspectorRoot,
  selectedInspectorSubject,
  selectedSession,
  workspaceState
}: AnalysisInspectorPanelProps) {
  const roots = selectedSession
    ? buildAnalysisInspectorRoots(selectedSession, selectedInspectorSubject)
    : draftContext
      ? [
          {
            key: "context" as const,
            owner: draftContext.root.owner,
            title: draftContext.root.title,
            tree: draftContext.root
          }
        ]
      : [];
  const shouldRenderDraftContextViewport = Boolean(draftContext && !selectedSession);

  const activeRoot =
    inspectorTreeState.rootKey === null
      ? null
      : roots.find((root) => root.key === inspectorTreeState.rootKey) ?? null;
  const activeContextRoot =
    activeRoot?.key === "context"
      ? activeRoot.tree
      : shouldRenderDraftContextViewport
        ? draftContext!.root
        : null;
  const isContextViewport = Boolean(activeContextRoot);
  const selectedPathNodes = activeRoot
    ? findInspectorTreePathNodes(activeRoot.tree, inspectorTreeState.path)
    : null;
  const selectedNode = selectedPathNodes?.at(-1) ?? null;
  const selectedNodePresentation = selectedNode
    ? buildInspectorNodePresentation(selectedNode, selectedPathNodes?.slice(0, -1) ?? [])
    : null;
  const panelTitle = selectedNodePresentation
    ? isContextViewport
      ? "上下文目录"
      : getInspectorPresentationTitle(selectedNodePresentation, {
          includeChildCount: selectedNode?.kind === "directory"
        })
    : isContextViewport
      ? "上下文目录"
      : getInspectorRootsViewTitle(draftContext, selectedInspectorSubject);
  const panelDescription = isContextViewport
    ? createContextViewportBoundaryTags({
        draftContext,
        selectedSession,
        selectedSubject: selectedInspectorSubject
      })
    : selectedNodePresentation?.description ?? contextPanelNote;

  return (
    <SidePanel
      description={panelDescription}
      empty={
        workspaceState.kind === "draft"
          ? {
              description: "当前还没有附带上下文，可直接输入问题或从其他入口带入。",
              title: "分析详情"
            }
          : {
              description: "当前消息没有可展示的分析详情。",
              title: "分析详情"
            }
      }
      title={panelTitle}
    >
      {roots.length === 0 ? null : isContextViewport && activeContextRoot ? (
        <AnalysisContextTreeViewport
          initialPath={inspectorTreeState.path}
          onBack={selectedSession ? onPopInspectorPath : undefined}
          root={activeContextRoot}
          showBack={Boolean(selectedSession && activeRoot?.key === "context")}
        />
      ) : !activeRoot || !selectedNode ? (
        <InspectorRootPanel onSelectRoot={onSelectInspectorRoot} roots={roots} />
      ) : (
        <InspectorTreeNodePanel
          ancestors={selectedPathNodes?.slice(0, -1) ?? []}
          node={selectedNode}
          onBack={onPopInspectorPath}
          onSelectChild={onSelectInspectorNode}
          showBack={inspectorTreeState.path.length >= 1}
        />
      )}
    </SidePanel>
  );
}
