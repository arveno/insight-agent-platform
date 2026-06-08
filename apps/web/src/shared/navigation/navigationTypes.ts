import type { ReactNode } from "react";

import type { IconName } from "../icons/iconTypes";
import type { ActionButtonVariant } from "../ui/actions/actionTypes";

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

export type NavigateToRoute = (route: StaticRouteKey) => void;

export type PageRouteProps = {
  onNavigate?: NavigateToRoute;
};

export type WebPageProps = PageRouteProps & {
  dataKnowledgeState?: unknown;
  metricsState?: unknown;
  platformOperationsState?: unknown;
  reportsState?: unknown;
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
