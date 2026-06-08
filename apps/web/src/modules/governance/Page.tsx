import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { governanceStaticViewModel } from "./fixtures/governanceStaticViewModel";
import { GovernanceSections } from "./sections/GovernanceSections";

export function GovernancePage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={governanceStaticViewModel}>
      <GovernanceSections onNavigate={onNavigate} viewModel={governanceStaticViewModel} />
    </WebPageScaffold>
  );
}
