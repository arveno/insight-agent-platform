import { observabilityStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
import { ObservabilitySections } from "./sections/ObservabilitySections";

export function ObservabilityPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={observabilityStaticViewModel}>
      <ObservabilitySections onNavigate={onNavigate} viewModel={observabilityStaticViewModel} />
    </WebPageScaffold>
  );
}
