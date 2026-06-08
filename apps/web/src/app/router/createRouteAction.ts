import type { ReactNode } from "react";

import type { StaticRouteKey } from "../shell/models/staticViewModelTypes";
import type { IconName } from "../../shared/icons/iconTypes";
import type {
  AppActionButtonVariant,
  AppActionGroupItem
} from "../../shared/ui/actions/actionTypes";

import type { NavigateToRoute } from "./pageProps";

export type CreateRouteActionArgs = {
  ariaLabel?: string;
  disabled?: boolean;
  iconName?: IconName;
  key: string;
  label: ReactNode;
  onNavigate?: NavigateToRoute;
  route?: StaticRouteKey;
  title?: string;
  variant: AppActionButtonVariant;
};

export function createRouteAction({
  ariaLabel,
  disabled,
  iconName,
  key,
  label,
  onNavigate,
  route,
  title,
  variant
}: CreateRouteActionArgs): AppActionGroupItem {
  return {
    ariaLabel,
    disabled,
    iconName,
    key,
    label,
    onClick: route && onNavigate ? () => onNavigate(route) : undefined,
    title,
    variant
  };
}
