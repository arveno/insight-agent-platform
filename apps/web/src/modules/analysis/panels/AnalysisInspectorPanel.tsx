import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

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
  createDecisionsRootNodeId,
  createEvidenceRootNodeId,
  createModelCallsRootNodeId,
  createReportsRootNodeId,
  createRunHistoryRootNodeId,
  createRunTraceRootNodeId,
  createToolCallsRootNodeId,
  findInspectorTreeNode
} from "../models/inspectorTree";
import type { AnalysisTaskContextPack } from "../models/runtimeContractTypes";
import { InspectorRootPanel } from "./inspector/InspectorRootPanel";
import { InspectorTreeNodePanel } from "./inspector/InspectorTreeNodePanel";

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

function createContextRoot(session: AnalysisSessionViewModel): InspectorTreeNode {
  return {
    nodeId: createContextRootNodeId(session.analysisTaskId),
    kind: "contextRoot",
    role: "inputContext",
    owner: {
      analysisTaskId: session.analysisTaskId,
      type: "analysisTask"
    },
    title: "Context",
    summary: "本次请求上下文属于 AnalysisTask，不属于 Conversation 或 AnalysisRun。",
    children: session.analysisTaskContextPack ? [session.analysisTaskContextPack.root] : []
  };
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
  kind: AnalysisInspectorRootKey;
  nodes: InspectorTreeNode[];
  runId: string;
  summary: string;
  title: string;
}): InspectorTreeNode {
  const nodeIdByKind: Record<Exclude<AnalysisInspectorRootKey, "context" | "run-history" | "run-trace" | "runtime-references">, string> =
    {
      "decisions": createDecisionsRootNodeId(args.runId),
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

function createSessionRoots(
  session: AnalysisSessionViewModel,
  subject: InspectorSubject | undefined
): AnalysisInspectorRoot[] {
  const contextRoot = createContextRoot(session);
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
                runId: session.reportPreview!.runId,
                type: "analysisRun"
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
  const decisionRoot = createCollectionRoot({
    kind: "decisions",
    nodes: session.decisions.map((item) => ({
      nodeId: item.decisionId,
      kind: "decision",
      role: "decision",
      owner: {
        runId: item.runId,
        type: "analysisRun"
      },
      title: item.title,
      summary: item.createdAtText
    })),
    runId: session.currentRun.runId,
    summary: "本次运行沉淀的决策结果。",
    title: "决策结果"
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
        title: "Context",
        tree: contextRoot
      },
      {
        key: "run-history",
        title: "运行记录",
        tree: runHistoryRoot
      }
    ];
  }

  return [
    {
      key: "run-trace",
      title: "Run Trace",
      tree: runTraceRoot
    },
    {
      key: "context",
      title: "Context",
      tree: contextRoot
    },
    ...(session.sourceEvidence.length > 0
      ? [{ key: "evidence" as const, title: "生成证据", tree: evidenceRoot }]
      : []),
    ...(session.reportPreview ? [{ key: "reports" as const, title: "输出报告", tree: reportRoot }] : []),
    ...(session.decisions.length > 0
      ? [{ key: "decisions" as const, title: "决策结果", tree: decisionRoot }]
      : []),
    ...(session.toolDetails.length > 0
      ? [{ key: "tool-calls" as const, title: "Tool Call", tree: toolRoot }]
      : []),
    ...(session.modelDetails.length > 0
      ? [{ key: "model-calls" as const, title: "Model Call", tree: modelRoot }]
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
    ? createSessionRoots(selectedSession, selectedInspectorSubject)
    : draftContext
      ? [
          {
            key: "context" as const,
            title: "Context",
            tree: draftContext.root
          }
        ]
      : [];

  const activeRoot =
    inspectorTreeState.rootKey === null
      ? null
      : roots.find((root) => root.key === inspectorTreeState.rootKey) ?? null;
  const selectedNode = activeRoot
    ? findInspectorTreeNode(activeRoot.tree, inspectorTreeState.path)
    : null;

  return (
    <SidePanel
      description={contextPanelNote}
      empty={
        workspaceState.kind === "draft"
          ? {
              description: "当前没有 draft context。可从 Dashboard context draft 进入，或直接空白提问。",
              title: "Inspector"
            }
          : {
              description: "当前 subject 没有可展示的 Inspector roots。",
              title: "Inspector"
            }
      }
      title="Analysis inspector"
    >
      {roots.length === 0 ? null : !activeRoot || !selectedNode ? (
        <InspectorRootPanel onSelectRoot={onSelectInspectorRoot} roots={roots} />
      ) : (
        <InspectorTreeNodePanel
          node={selectedNode}
          onBack={onPopInspectorPath}
          onSelectChild={onSelectInspectorNode}
          showBack={inspectorTreeState.path.length > 0}
        />
      )}
    </SidePanel>
  );
}
