import { workspaceStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
import { WorkspaceSections } from "./sections/WorkspaceSections";

export function WorkspacePage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={workspaceStaticViewModel}>
      <WorkspaceSections onNavigate={onNavigate} viewModel={workspaceStaticViewModel} />
    </WebPageScaffold>
  );
}
