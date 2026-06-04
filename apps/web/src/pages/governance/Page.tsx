import { governanceStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { GovernanceSections } from "./sections";

export function GovernancePage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={governanceStaticViewModel}>
      <GovernanceSections onNavigate={onNavigate} viewModel={governanceStaticViewModel} />
    </WebPageScaffold>
  );
}
