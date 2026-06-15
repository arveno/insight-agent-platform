import type { ReactNode } from "react";
import type { AnalysisTaskContextPack } from "@insight-agent/contracts/generated/typescript";

import type { IconName } from "../icons/iconTypes";
import type { ActionButtonVariant } from "../ui/actions/actionTypes";
import type { ContextTreeNodeDisplayMap } from "../view-model/contextTreeNodeDisplay";

export type StaticRouteKey =
  | "dashboard"
  | "analysis"
  | "reports"
  | "data-knowledge"
  | "metrics"
  | "model-tools"
  | "observability"
  | "governance"
  | "evaluation"
  | "feedback"
  | "memory"
  | "platform-operations"
  | "settings"
  | "workspace";

export type AnalysisContextRouteState = AnalysisTaskContextPack;

export type AppRouteState = {
  analysisContextNodeDisplay?: ContextTreeNodeDisplayMap;
  analysisContextPack?: AnalysisContextRouteState;
};

export type NavigateToRoute = (route: StaticRouteKey, routeState?: AppRouteState) => void;

export type PageRouteProps = {
  onNavigate?: NavigateToRoute;
  routeState?: AppRouteState;
};

export type NavigationAction = {
  ariaLabel?: string;
  disabled?: boolean;
  iconName?: IconName;
  key: string;
  label: ReactNode;
  onClick?: () => void;
  title?: string;
  variant: ActionButtonVariant;
};
