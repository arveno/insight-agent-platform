import type { PageRouteProps } from "../../shared/navigation/navigationTypes";
import { AnalysisWorkspace } from "./components/AnalysisWorkspace";
import {
  useAnalysisWorkspaceController,
  type AnalysisDraftSubmitIdentity
} from "./hooks/useAnalysisWorkspaceController";

type AnalysisPageProps = PageRouteProps & {
  submitIdentity?: AnalysisDraftSubmitIdentity;
};

export function AnalysisPage({ routeState, submitIdentity }: AnalysisPageProps) {
  const controller = useAnalysisWorkspaceController({
    draftContext: routeState?.analysisContextPack,
    draftContextNodeDisplay: routeState?.analysisContextNodeDisplay,
    submitIdentity
  });

  return <AnalysisWorkspace controller={controller} />;
}
