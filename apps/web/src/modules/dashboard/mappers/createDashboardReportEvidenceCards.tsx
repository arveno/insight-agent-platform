import type { DashboardReportEvidenceCardItem } from "../components/dashboardComponentTypes";
import type { DashboardViewModel } from "../models/dashboardViewModel";

type CreateDashboardReportEvidenceCardsArgs = {
  evidenceEntrances: DashboardViewModel["evidenceEntrances"];
  recentReports: DashboardViewModel["recentReports"];
};

export function createDashboardReportEvidenceCards({
  evidenceEntrances,
  recentReports
}: CreateDashboardReportEvidenceCardsArgs): DashboardReportEvidenceCardItem[] {
  return [
    ...recentReports.map((report) => ({
      key: report.key,
      kind: "report" as const,
      report
    })),
    ...evidenceEntrances.map((evidence) => ({
      evidence,
      key: evidence.key,
      kind: "evidence" as const
    }))
  ];
}
