import type { ReactNode } from "react";

import type {
  AppRouteState,
  NavigateToRoute,
  StaticRouteKey
} from "../../shared/navigation/navigationTypes";
import type { ShellRegionSlots } from "../../shared/layout/ShellRegionSlots";
import { useAnalysisShellSlots } from "../../modules/analysis/hooks/useAnalysisShellSlots";
import { useDashboardShellSlots } from "../../modules/dashboard/Page";
import { useDataKnowledgeShellSlots } from "../../modules/data-knowledge/hooks/useDataKnowledgeShellSlots";
import { useMetricsShellSlots } from "../../modules/metrics/hooks/useMetricsShellSlots";
import { useReportsShellSlots } from "../../modules/reports/hooks/useReportsShellSlots";

import { AppShellLayout } from "./AppShellLayout";

export const moduleShellRoutes = [
  "dashboard",
  "analysis",
  "reports",
  "data-knowledge",
  "metrics"
] as const satisfies StaticRouteKey[];

type ModuleShellRouteKey = (typeof moduleShellRoutes)[number];

export function hasModuleShellRoute(route: StaticRouteKey): route is ModuleShellRouteKey {
  return moduleShellRoutes.includes(route as ModuleShellRouteKey);
}

type SelectedWorkspace = {
  name: string;
  workspaceId: string;
};

export type RouteShellOutletProps = {
  activeRoute: StaticRouteKey;
  routeState?: AppRouteState;
  defaultMainContent: ReactNode;
  header?: ReactNode;
  leftNavMode: "root" | StaticRouteKey;
  onBackToRoot: () => void;
  onNavigate?: NavigateToRoute;
  renderLeftNav: (content: ReactNode) => ReactNode;
  rootLeftNavContent: ReactNode;
  selectedBusinessDomainId: string;
  selectedWorkspace: SelectedWorkspace;
};

type ModuleRouteShellLayoutProps = Pick<
  RouteShellOutletProps,
  "defaultMainContent" | "header" | "leftNavMode" | "renderLeftNav" | "rootLeftNavContent"
> & {
  routeKey: ModuleShellRouteKey;
  slots: ShellRegionSlots;
};

function ModuleRouteShellLayout({
  defaultMainContent,
  header,
  leftNavMode,
  renderLeftNav,
  rootLeftNavContent,
  routeKey,
  slots
}: ModuleRouteShellLayoutProps) {
  const leftNavContent =
    leftNavMode === routeKey && slots.leftNav ? slots.leftNav : rootLeftNavContent;

  return (
    <AppShellLayout
      header={header}
      leftNav={renderLeftNav(leftNavContent)}
      rightAssistPanel={slots.rightAssistPanel ?? null}
    >
      {slots.mainContent ?? defaultMainContent}
    </AppShellLayout>
  );
}

function AnalysisRouteShell({
  defaultMainContent,
  header,
  leftNavMode,
  onBackToRoot,
  onNavigate,
  renderLeftNav,
  routeState,
  rootLeftNavContent,
  selectedBusinessDomainId,
  selectedWorkspace
}: RouteShellOutletProps) {
  const slots = useAnalysisShellSlots({
    businessDomainId: selectedBusinessDomainId,
    onBackToRoot,
    onNavigate,
    routeState
  });

  return (
    <ModuleRouteShellLayout
      defaultMainContent={defaultMainContent}
      header={header}
      leftNavMode={leftNavMode}
      renderLeftNav={renderLeftNav}
      rootLeftNavContent={rootLeftNavContent}
      routeKey="analysis"
      slots={slots}
    />
  );
}

function DashboardRouteShell({
  defaultMainContent,
  header,
  leftNavMode,
  onNavigate,
  renderLeftNav,
  rootLeftNavContent,
  selectedWorkspace
}: RouteShellOutletProps) {
  const slots = useDashboardShellSlots({
    onNavigate,
    workspaceId: selectedWorkspace.workspaceId,
    workspaceName: selectedWorkspace.name
  });

  return (
    <ModuleRouteShellLayout
      defaultMainContent={defaultMainContent}
      header={header}
      leftNavMode={leftNavMode}
      renderLeftNav={renderLeftNav}
      rootLeftNavContent={rootLeftNavContent}
      routeKey="dashboard"
      slots={slots}
    />
  );
}

function ReportsRouteShell({
  defaultMainContent,
  header,
  leftNavMode,
  onBackToRoot,
  onNavigate,
  renderLeftNav,
  rootLeftNavContent
}: RouteShellOutletProps) {
  const slots = useReportsShellSlots({
    onBackToRoot,
    onNavigate
  });

  return (
    <ModuleRouteShellLayout
      defaultMainContent={defaultMainContent}
      header={header}
      leftNavMode={leftNavMode}
      renderLeftNav={renderLeftNav}
      rootLeftNavContent={rootLeftNavContent}
      routeKey="reports"
      slots={slots}
    />
  );
}

function DataKnowledgeRouteShell({
  defaultMainContent,
  header,
  leftNavMode,
  onBackToRoot,
  onNavigate,
  renderLeftNav,
  rootLeftNavContent,
  selectedWorkspace
}: RouteShellOutletProps) {
  const slots = useDataKnowledgeShellSlots({
    onBackToRoot,
    onNavigate,
    workspaceId: selectedWorkspace.workspaceId,
    workspaceName: selectedWorkspace.name
  });

  return (
    <ModuleRouteShellLayout
      defaultMainContent={defaultMainContent}
      header={header}
      leftNavMode={leftNavMode}
      renderLeftNav={renderLeftNav}
      rootLeftNavContent={rootLeftNavContent}
      routeKey="data-knowledge"
      slots={slots}
    />
  );
}

function MetricsRouteShell({
  defaultMainContent,
  header,
  leftNavMode,
  onBackToRoot,
  onNavigate,
  renderLeftNav,
  rootLeftNavContent,
  selectedWorkspace
}: RouteShellOutletProps) {
  const slots = useMetricsShellSlots({
    onBackToRoot,
    onNavigate,
    workspaceId: selectedWorkspace.workspaceId,
    workspaceName: selectedWorkspace.name
  });

  return (
    <ModuleRouteShellLayout
      defaultMainContent={defaultMainContent}
      header={header}
      leftNavMode={leftNavMode}
      renderLeftNav={renderLeftNav}
      rootLeftNavContent={rootLeftNavContent}
      routeKey="metrics"
      slots={slots}
    />
  );
}

function DefaultRouteShell({
  defaultMainContent,
  header,
  renderLeftNav,
  rootLeftNavContent
}: RouteShellOutletProps) {
  return (
    <AppShellLayout
      header={header}
      leftNav={renderLeftNav(rootLeftNavContent)}
      rightAssistPanel={null}
    >
      {defaultMainContent}
    </AppShellLayout>
  );
}

export function RouteShellOutlet(props: RouteShellOutletProps) {
  switch (props.activeRoute) {
    case "dashboard":
      return <DashboardRouteShell {...props} />;
    case "analysis":
      return <AnalysisRouteShell {...props} />;
    case "reports":
      return <ReportsRouteShell {...props} />;
    case "data-knowledge":
      return <DataKnowledgeRouteShell {...props} />;
    case "metrics":
      return <MetricsRouteShell {...props} />;
    default:
      return <DefaultRouteShell {...props} />;
  }
}
