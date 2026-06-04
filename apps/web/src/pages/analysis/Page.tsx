import { analysisStaticViewModel } from "../../features/static-view-models";
import type { WebPageProps } from "../_shared";
import { AnalysisSections } from "./sections";

export function AnalysisPage({ onNavigate }: WebPageProps) {
  return <AnalysisSections onNavigate={onNavigate} viewModel={analysisStaticViewModel} />;
}
