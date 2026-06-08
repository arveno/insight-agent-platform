import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { workspaceStaticViewModel } from "./fixtures/workspaceStaticViewModel";
import { WorkspaceSections } from "./sections/WorkspaceSections";

export function WorkspacePage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={workspaceStaticViewModel}>
      <WorkspaceSections onNavigate={onNavigate} viewModel={workspaceStaticViewModel} />
    </WebPageScaffold>
  );
}
