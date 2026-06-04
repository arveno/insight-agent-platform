import { analysisStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { AnalysisSections } from "./sections";

export function AnalysisPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={analysisStaticViewModel}>
      <AnalysisSections onNavigate={onNavigate} viewModel={analysisStaticViewModel} />
    </WebPageScaffold>
  );
}
