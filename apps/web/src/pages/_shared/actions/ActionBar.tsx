import { Space } from "antd";

import type { StaticActionViewModel } from "../../../app/models";
import { AppActionButton, type AppActionButtonVariant } from "../../../shared";
import { actionDescription } from "../adapters";
import { translateKey, type Translate } from "../text";
import type { NavigateToRoute } from "../types";

export type ActionBarProps = {
  actions: StaticActionViewModel[];
  onNavigate?: NavigateToRoute;
  t: Translate;
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
    <Space wrap>
      {actions.map((action) => (
        <AppActionButton
          disabled={action.disabled}
          key={action.key}
          onClick={() => {
            if (action.targetRoute) {
              onNavigate?.(action.targetRoute);
            }
          }}
          title={actionDescription(t, action)}
          variant={actionButtonVariant(action)}
        >
          {translateKey(t, action.labelKey)}
        </AppActionButton>
      ))}
    </Space>
  );
}
