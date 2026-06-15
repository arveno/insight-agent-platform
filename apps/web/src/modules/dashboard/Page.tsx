import { useEffect, useState } from "react";
import { Alert, Flex, Spin, Typography } from "antd";
import type { Metric } from "@insight-agent/contracts/generated/typescript";

import { loadWorkspaceMetrics } from "../../api/adapters/loadWorkspaceMetrics";
import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { ShellRegionSlots } from "../../shared/layout/ShellRegionSlots";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";
import { useCurrentWorkspaceBinding } from "../../shared/workspace/CurrentWorkspaceBindingProvider";
import type { CurrentWorkspaceBinding } from "../../shared/workspace/CurrentWorkspaceBindingProvider";

import { createDashboardViewModel } from "./mappers/createDashboardViewModel";
import type { DashboardSurfaceViewModel } from "./models/dashboardViewModel";
import { DashboardSections, DashboardInspectorPanel } from "./sections/DashboardSections";

type DashboardPageProps = PageRouteProps & {
  metricsLoader?: () => Promise<Metric[]>;
};

type DashboardLoaders = {
  metricsLoader?: () => Promise<Metric[]>;
};

export type DashboardContextTreeViewport = {
  activeNodeId: string;
  expandedNodeIds: string[];
};

export type DashboardOverviewController = {
  errorMessage?: string;
  onExpandContextTree: (nodeIds: string[]) => void;
  onSelectContextNode: (nodeId: string) => void;
  onTimeRangeChange: (key: DashboardSurfaceViewModel["timeRange"]["selectedKey"]) => void;
  selectedTimeRange: DashboardSurfaceViewModel["timeRange"]["options"][number];
  selectedTimeRangeKey: DashboardSurfaceViewModel["timeRange"]["selectedKey"];
  state: "loading" | "ready" | "error";
  viewModel: DashboardSurfaceViewModel;
  viewport: DashboardContextTreeViewport;
  workspaceBinding: CurrentWorkspaceBinding;
};

export type DashboardPageContentProps = PageRouteProps & {
  controller: DashboardOverviewController;
};

export function createDashboardContextTreeViewport(
  viewModel: DashboardSurfaceViewModel
): DashboardContextTreeViewport {
  return {
    activeNodeId: viewModel.root.nodeId,
    expandedNodeIds: [
      viewModel.root.nodeId,
      "dashboard-node-directory-metrics"
    ]
  };
}

export function useDashboardOverviewState(
  workspaceBinding?: CurrentWorkspaceBinding,
  loaders: DashboardLoaders = {}
): DashboardOverviewController {
  const currentWorkspaceBinding = useCurrentWorkspaceBinding();
  const resolvedWorkspaceBinding = workspaceBinding ?? currentWorkspaceBinding;
  const metricsLoader = loaders.metricsLoader ?? loadWorkspaceMetrics;
  const [selectedTimeRangeKey, setSelectedTimeRangeKey] =
    useState<DashboardSurfaceViewModel["timeRange"]["selectedKey"]>("last_30_days");
  const [viewModel, setViewModel] = useState(() =>
    createDashboardViewModel([], resolvedWorkspaceBinding)
  );
  const [viewport, setViewport] = useState<DashboardContextTreeViewport>(() =>
    createDashboardContextTreeViewport(createDashboardViewModel([], resolvedWorkspaceBinding))
  );
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    setState("loading");
    setErrorMessage(undefined);

    void metricsLoader()
      .then((metrics) => {
        if (cancelled) {
          return;
        }

        const nextViewModel = createDashboardViewModel(metrics, resolvedWorkspaceBinding);

        setViewModel(nextViewModel);
        setViewport(createDashboardContextTreeViewport(nextViewModel));
        setSelectedTimeRangeKey("last_30_days");
        setState("ready");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setErrorMessage("暂时无法加载 Dashboard 指标。");
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [metricsLoader, resolvedWorkspaceBinding.workspaceId, resolvedWorkspaceBinding.workspaceName]);

  const selectedTimeRange = viewModel.timeRange.options.find(
    (option) => option.key === selectedTimeRangeKey
  );

  if (!selectedTimeRange) {
    throw new Error(`Unknown dashboard time range: ${selectedTimeRangeKey}`);
  }

  return {
    errorMessage,
    onExpandContextTree: (nodeIds) => {
      setViewport((currentViewport) => ({
        activeNodeId: currentViewport.activeNodeId,
        expandedNodeIds: nodeIds
      }));
    },
    onSelectContextNode: (nodeId) => {
      setViewport((currentViewport) => ({
        activeNodeId: nodeId,
        expandedNodeIds: currentViewport.expandedNodeIds
      }));
    },
    onTimeRangeChange: setSelectedTimeRangeKey,
    selectedTimeRange,
    selectedTimeRangeKey,
    state,
    viewModel,
    viewport,
    workspaceBinding: resolvedWorkspaceBinding
  };
}

export function DashboardPage({
  metricsLoader,
  onNavigate
}: DashboardPageProps) {
  const controller = useDashboardOverviewState(undefined, { metricsLoader });

  return <DashboardPageContent controller={controller} onNavigate={onNavigate} />;
}

export function useDashboardShellSlots({
  onNavigate,
  workspaceId,
  workspaceName
}: {
  onNavigate?: PageRouteProps["onNavigate"];
  workspaceId?: string;
  workspaceName?: string;
}): ShellRegionSlots {
  const currentWorkspaceBinding = useCurrentWorkspaceBinding();
  const controller = useDashboardOverviewState({
    workspaceId: workspaceId ?? currentWorkspaceBinding.workspaceId,
    workspaceName: workspaceName ?? currentWorkspaceBinding.workspaceName
  });

  return {
    mainContent: <DashboardPageContent controller={controller} onNavigate={onNavigate} />,
    rightAssistPanel:
      controller.state === "ready" ? (
        <DashboardInspectorPanel
          activeNodeId={controller.viewport.activeNodeId}
          expandedNodeIds={controller.viewport.expandedNodeIds}
          onExpandNodes={controller.onExpandContextTree}
          onSelectNode={controller.onSelectContextNode}
          selectedTimeRangeLabel={controller.selectedTimeRange.label}
          viewModel={controller.viewModel}
          workspaceName={controller.workspaceBinding.workspaceName}
        />
      ) : null
  };
}

export function DashboardPageContent({
  controller,
  onNavigate
}: DashboardPageContentProps) {
  if (controller.state === "loading") {
    return (
      <ResponsivePageShell>
        <Flex align="center" justify="center" style={{ minHeight: 320 }} vertical gap={16}>
          <Spin size="large" />
          <Typography.Text type="secondary">正在读取当前 Workspace 的共享指标。</Typography.Text>
        </Flex>
      </ResponsivePageShell>
    );
  }

  if (controller.state === "error") {
    return (
      <ResponsivePageShell>
        <Alert message={controller.errorMessage ?? "暂时无法加载 Dashboard 指标。"} showIcon type="error" />
      </ResponsivePageShell>
    );
  }

  return (
    <ResponsivePageShell>
      <DashboardSections
        onNavigate={onNavigate}
        onTimeRangeChange={controller.onTimeRangeChange}
        selectedTimeRange={controller.selectedTimeRange}
        selectedTimeRangeKey={controller.selectedTimeRangeKey}
        viewModel={controller.viewModel}
      />
    </ResponsivePageShell>
  );
}
