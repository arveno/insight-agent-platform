import type {
  StaticActionViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel,
  StaticTabViewModel
} from "../../../shared/view-model/staticViewModelTypes";

export type ModelToolsViewModel = StaticPageViewModelBase & {
  configDetail: StaticSummaryItemViewModel;
  modelConfigs: StaticSummaryItemViewModel[];
  modelToolsState: StaticPageStateViewModel;
  modelToolsTabs: StaticTabViewModel[];
  permissionEntrances: StaticActionViewModel[];
  permissionSummaryEntries: StaticSummaryItemViewModel[];
  promptVersions: StaticSummaryItemViewModel[];
  ragStrategies: StaticSummaryItemViewModel[];
  relatedDataKnowledgeEntrances: StaticActionViewModel[];
  routingPolicies: StaticSummaryItemViewModel[];
  runtimeObservationEntrances: StaticActionViewModel[];
  selectedModelConfig: StaticSummaryItemViewModel;
  selectedPromptVersion: StaticSummaryItemViewModel;
  selectedRagStrategy: StaticSummaryItemViewModel;
  selectedRoutingPolicy: StaticSummaryItemViewModel;
  selectedTab: string;
  selectedToolDefinition: StaticSummaryItemViewModel;
  toolDefinitions: StaticSummaryItemViewModel[];
};
