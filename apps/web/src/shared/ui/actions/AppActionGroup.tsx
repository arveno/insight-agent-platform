import { Space } from "antd";

import { AppActionButton } from "./AppActionButton";
import type { AppActionButtonVariant, AppActionGroupProps } from "./actionButtonTypes";

const actionVariantOrder: Record<AppActionButtonVariant, number> = {
  globalPrimary: 0,
  contextPrimary: 1,
  moduleEntry: 2,
  objectDetail: 3,
  sourceLink: 4
};

export function AppActionGroup({ actions }: AppActionGroupProps) {
  if (actions.length === 0) {
    return null;
  }

  const sortedActions = actions
    .map((action, index) => ({ action, index }))
    .sort((left, right) => {
      const orderDelta =
        actionVariantOrder[left.action.variant] - actionVariantOrder[right.action.variant];

      return orderDelta === 0 ? left.index - right.index : orderDelta;
    })
    .map(({ action }) => action);

  return (
    <Space wrap>
      {sortedActions.map((action) => (
        <AppActionButton
          aria-label={action.ariaLabel}
          disabled={action.disabled}
          iconName={action.iconName}
          key={action.key}
          onClick={action.onClick}
          title={action.title}
          variant={action.variant}
        >
          {action.label}
        </AppActionButton>
      ))}
    </Space>
  );
}
