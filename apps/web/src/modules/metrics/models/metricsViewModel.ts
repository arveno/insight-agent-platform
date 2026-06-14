import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
} from "../../../shared/view-model/staticViewModelTypes";
import type { AnalysisTaskContextPack } from "@insight-agent/contracts/generated/typescript";

export type MetricsWorkspaceBinding = {
  workspaceId: string;
  workspaceName: string;
};

export type MetricListItemViewModel = {
  key: string;
  metricId: string;
  metricName: string;
};

export type MetricContextSourceViewModel = {
  key: string;
  meta: string;
  description: string;
  title: string;
};

export type MetricDetailViewModel = {
  analysisContextPack: AnalysisTaskContextPack;
  businessDomainId: string;
  businessDomainLabel: string;
  contextSources: MetricContextSourceViewModel[];
  currentValue: string;
  definition: string;
  formulaSummary: string;
  key: string;
  metricId: string;
  metricName: string;
  ownerTeam: string;
  period: string;
  riskLevel: string;
  status: string;
  thresholdSummary: string;
  trendLabel: string;
  workspaceId: string;
};

export type MetricsViewModel = StaticPageViewModelBase & {
  metrics: MetricListItemViewModel[];
  metricsState: StaticPageStateViewModel;
  readonlyNotice: string;
  selectedMetric: MetricDetailViewModel;
  workspaceNotice: string;
};
