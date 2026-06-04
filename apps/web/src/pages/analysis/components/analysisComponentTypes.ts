import type { AnalysisViewModel } from "../../../features/static-view-models";
import type { WebPageProps } from "../../_shared";

export type AnalysisComponentProps = WebPageProps & {
  viewModel: AnalysisViewModel;
};
