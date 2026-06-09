import type { ReactNode } from "react";

import type { EmptyStateProps } from "../ui/states/EmptyState";
import type { ErrorStateProps } from "../ui/states/ErrorState";
import type { LoadingStateProps } from "../ui/states/LoadingState";

export type ChartPointViewModel = {
  key: string;
  label: string;
  value: number;
};

export type ChartSeriesViewModel = {
  color?: string;
  key: string;
  label: string;
  points: ChartPointViewModel[];
};

export type ChartContainerState =
  | { kind: "ready" }
  | { kind: "loading"; loading?: LoadingStateProps }
  | { kind: "empty"; empty?: EmptyStateProps }
  | { kind: "error"; error: ErrorStateProps };

export type ChartCardViewModel = {
  actions?: ReactNode;
  legend?: ReactNode;
  state?: ChartContainerState;
  subtitle?: ReactNode;
  title: ReactNode;
};
