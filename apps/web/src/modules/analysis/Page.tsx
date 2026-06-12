import type { PageRouteProps } from "../../shared/navigation/navigationTypes";
import { AnalysisWorkspace } from "./components/AnalysisWorkspace";
import { useAnalysisWorkspaceController } from "./hooks/useAnalysisWorkspaceController";

export function AnalysisPage({ routeState }: PageRouteProps) {
  const controller = useAnalysisWorkspaceController({
    draftContext: routeState?.draftContextPack
  });

  return <AnalysisWorkspace controller={controller} />;
}
