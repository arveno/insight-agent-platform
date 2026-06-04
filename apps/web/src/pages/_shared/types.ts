import type { StaticRouteKey } from "../../app/models";

export type NavigateToRoute = (route: StaticRouteKey) => void;

export type WebPageProps = {
  onNavigate?: NavigateToRoute;
};
