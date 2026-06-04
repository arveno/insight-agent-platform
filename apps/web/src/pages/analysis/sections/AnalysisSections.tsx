import type { AnalysisViewModel } from "../../../features/static-view-models";
import { AppSectionStack } from "../../../shared";
import type { WebPageProps } from "../../_shared";
import {
  AnalysisBoundaryPanel,
  AnalysisContextRunPanels,
  AnalysisConversationPanel,
  AnalysisEntrancesPanel,
  AnalysisHero,
  AnalysisRunStatePanel
} from "../components";

export type AnalysisSectionsProps = WebPageProps & {
  viewModel: AnalysisViewModel;
};

export function AnalysisSections({ onNavigate, viewModel }: AnalysisSectionsProps) {
  return (
    <AppSectionStack>
      <AnalysisHero onNavigate={onNavigate} viewModel={viewModel} />
      <AnalysisContextRunPanels onNavigate={onNavigate} viewModel={viewModel} />
      <AnalysisRunStatePanel onNavigate={onNavigate} viewModel={viewModel} />
      <AnalysisConversationPanel onNavigate={onNavigate} viewModel={viewModel} />
      <AnalysisEntrancesPanel onNavigate={onNavigate} viewModel={viewModel} />
      <AnalysisBoundaryPanel onNavigate={onNavigate} viewModel={viewModel} />
    </AppSectionStack>
  );
}
