import type {
  StaticActionViewModel,
  StaticRouteKey
} from "../shell/models/staticViewModelTypes";
import type { Translate } from "../../shared/i18n/translateKey";
import { translateKey } from "../../shared/i18n/translateKey";
import type { IconName } from "../../shared/icons/iconTypes";
import { AppActionGroup } from "../../shared/ui/actions/AppActionGroup";
import type { AppActionButtonVariant } from "../../shared/ui/actions/actionTypes";

import { createRouteAction } from "./createRouteAction";
import type { NavigateToRoute } from "./pageProps";

export type RouteActionBarProps = {
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

function actionDescription(
  t: Translate,
  action: { description?: string; descriptionKey?: string }
): string | undefined {
  return action.descriptionKey ? translateKey(t, action.descriptionKey) : action.description;
}

export function RouteActionBar({ actions, onNavigate, t }: RouteActionBarProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <AppActionGroup
      actions={actions.map((action) =>
        createRouteAction({
          disabled: action.disabled,
          iconName: action.targetRoute ? routeIconByRoute[action.targetRoute] : undefined,
          key: action.key,
          label: translateKey(t, action.labelKey),
          onNavigate,
          route: action.targetRoute,
          title: actionDescription(t, action),
          variant: actionButtonVariant(action)
        })
      )}
    />
  );
}

export { RouteActionBar as ActionBar };
