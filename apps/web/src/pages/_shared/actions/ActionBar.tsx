import type { StaticActionViewModel, StaticRouteKey } from "../../../app/models";
import {
  AppActionGroup,
  type AppActionButtonVariant,
  type AppActionGroupItem,
  type IconName
} from "../../../shared";
import { actionDescription } from "../adapters";
import { translateKey, type Translate } from "../text";
import type { NavigateToRoute } from "../types";

export type ActionBarProps = {
  actions: StaticActionViewModel[];
  onNavigate?: NavigateToRoute;
  t: Translate;
};

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

function actionButtonVariant(action: StaticActionViewModel): AppActionButtonVariant {
  if (action.intent === "primary") {
    return "contextPrimary";
  }

  if (action.intent === "disabled" || action.intent === "readonly") {
    return "objectDetail";
  }

  return "moduleEntry";
}

export function ActionBar({ actions, onNavigate, t }: ActionBarProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <AppActionGroup
      actions={actions.map<AppActionGroupItem>((action) => ({
        disabled: action.disabled,
        iconName: action.targetRoute ? routeIconByRoute[action.targetRoute] : undefined,
        key: action.key,
        label: translateKey(t, action.labelKey),
        onClick: () => {
          if (action.targetRoute) {
            onNavigate?.(action.targetRoute);
          }
        },
        title: actionDescription(t, action),
        variant: actionButtonVariant(action)
      }))}
    />
  );
}
