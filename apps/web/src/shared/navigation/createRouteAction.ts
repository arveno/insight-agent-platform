import type { ReactNode } from "react";

import type { Translate } from "../i18n/translateKey";
import { translateKey } from "../i18n/translateKey";
import type { IconName } from "../icons/iconTypes";
import type { ActionButtonVariant } from "../ui/actions/actionTypes";
import type { StaticActionViewModel } from "../view-model/staticViewModelTypes";
import type {
  AppRouteState,
  NavigateToRoute,
  NavigationAction,
  StaticRouteKey
} from "./navigationTypes";

export type CreateRouteActionArgs = {
  ariaLabel?: string;
  disabled?: boolean;
  iconName?: IconName;
  key: string;
  label: ReactNode;
  onNavigate?: NavigateToRoute;
  route?: StaticRouteKey;
  routeState?: AppRouteState;
  title?: string;
  variant: ActionButtonVariant;
};

export function createRouteAction({
  ariaLabel,
  disabled,
  iconName,
  key,
  label,
  onNavigate,
  route,
  routeState,
  title,
  variant
}: CreateRouteActionArgs): NavigationAction {
  return {
    ariaLabel,
    disabled,
    iconName,
    key,
    label,
    onClick: route && onNavigate ? () => onNavigate(route, routeState) : undefined,
    title,
    variant
  };
}

const routeIconByRoute: Partial<Record<StaticRouteKey, IconName>> = {
  analysis: "analysis",
  dashboard: "dashboard",
  "data-knowledge": "data",
  evaluation: "evaluation",
  feedback: "feedback",
  governance: "governance",
  memory: "memory",
  metrics: "metrics",
  "model-tools": "models",
  observability: "observability",
  "platform-operations": "operations",
  reports: "reports",
  settings: "settings",
  workspace: "workspace"
};

const actionVariantByIntent: Record<StaticActionViewModel["intent"], ActionButtonVariant> = {
  disabled: "objectDetail",
  navigation: "moduleEntry",
  primary: "contextPrimary",
  readonly: "objectDetail",
  secondary: "moduleEntry"
};

function actionDescription(
  t: Translate,
  action: Pick<StaticActionViewModel, "description" | "descriptionKey">
) {
  return action.descriptionKey ? translateKey(t, action.descriptionKey) : action.description;
}

export function createNavigationActionFromViewModel(
  action: StaticActionViewModel,
  onNavigate: NavigateToRoute | undefined,
  t: Translate
): NavigationAction {
  return createRouteAction({
    disabled: action.disabled,
    iconName: action.targetRoute ? routeIconByRoute[action.targetRoute] : undefined,
    key: action.key,
    label: translateKey(t, action.labelKey),
    onNavigate,
    route: action.targetRoute,
    title: actionDescription(t, action),
    variant: actionVariantByIntent[action.intent]
  });
}

export function createNavigationActionsFromViewModel(
  actions: StaticActionViewModel[],
  onNavigate: NavigateToRoute | undefined,
  t: Translate
) {
  return actions.map((action) => createNavigationActionFromViewModel(action, onNavigate, t));
}
