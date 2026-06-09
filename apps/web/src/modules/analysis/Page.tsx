import type { PageRouteProps } from "../../shared/navigation/navigationTypes";
import { AnalysisWorkspace } from "./components/AnalysisWorkspace";
import { useAnalysisWorkspaceController } from "./hooks/useAnalysisWorkspaceController";

export function AnalysisPage(_props: PageRouteProps) {
  void _props;
  const controller = useAnalysisWorkspaceController();

  return <AnalysisWorkspace controller={controller} />;
}
