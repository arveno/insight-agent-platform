import type { ReactNode } from "react";

import type { EmptyStateProps } from "../ui/feedback/EmptyState";
import type { ErrorStateProps } from "../ui/feedback/ErrorState";
import type { LoadingStateProps } from "../ui/feedback/LoadingState";

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
