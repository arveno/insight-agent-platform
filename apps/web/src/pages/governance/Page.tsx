import { governanceStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
import { GovernanceSections } from "./sections/GovernanceSections";

export function GovernancePage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={governanceStaticViewModel}>
      <GovernanceSections onNavigate={onNavigate} viewModel={governanceStaticViewModel} />
    </WebPageScaffold>
  );
}
