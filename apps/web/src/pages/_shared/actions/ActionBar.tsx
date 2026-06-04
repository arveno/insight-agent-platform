import { Button, Space } from "antd";

import type { StaticActionViewModel } from "../../../app/models";
import { actionDescription } from "../adapters";
import { translateKey, type Translate } from "../text";
import type { NavigateToRoute } from "../types";

export type ActionBarProps = {
  actions: StaticActionViewModel[];
  onNavigate?: NavigateToRoute;
  t: Translate;
};

export function ActionBar({ actions, onNavigate, t }: ActionBarProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Space wrap>
      {actions.map((action) => (
        <Button
          disabled={action.disabled}
          key={action.key}
          onClick={() => {
            if (action.targetRoute) {
              onNavigate?.(action.targetRoute);
            }
          }}
          title={actionDescription(t, action)}
          type={action.intent === "primary" ? "primary" : "default"}
        >
          {translateKey(t, action.labelKey)}
        </Button>
      ))}
    </Space>
  );
}
