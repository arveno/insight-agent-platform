import { ActionButton } from "../ui/actions/ActionButton";
import type { NavigationAction } from "./navigationTypes";

export type NavigationActionButtonProps = {
  action: NavigationAction;
};

export function NavigationActionButton({ action }: NavigationActionButtonProps) {
  return (
    <ActionButton
      aria-label={action.ariaLabel}
      disabled={action.disabled}
      iconName={action.iconName}
      onClick={action.onClick}
      title={action.title}
      variant={action.variant}
    >
      {action.label}
    </ActionButton>
  );
}
