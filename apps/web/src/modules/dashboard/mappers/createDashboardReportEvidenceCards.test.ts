import { describe, expect, it } from "vitest";

import { dashboardStaticViewModel } from "../fixtures/dashboardStaticViewModel";
import { createDashboardReportEvidenceCards } from "./createDashboardReportEvidenceCards";

describe("createDashboardReportEvidenceCards", () => {
  it("flattens reports and evidence entrances into one lightweight item list", () => {
    const items = createDashboardReportEvidenceCards({
      evidenceEntrances: dashboardStaticViewModel.evidenceEntrances,
      recentReports: dashboardStaticViewModel.recentReports,
    });

    expect(items).toHaveLength(3);
    expect(items.map((item) => item.key)).toEqual([
      "weekly-business-report",
      "metric-revenue-evidence",
      "quality-job-evidence"
    ]);

    expect(items[0]).toMatchObject({
      key: "weekly-business-report",
      kind: "report",
      report: dashboardStaticViewModel.recentReports[0]
    });
    expect(items[1]).toMatchObject({
      evidence: dashboardStaticViewModel.evidenceEntrances[0],
      key: "metric-revenue-evidence",
      kind: "evidence"
    });
    expect(items[2]).toMatchObject({
      evidence: dashboardStaticViewModel.evidenceEntrances[1],
      key: "quality-job-evidence",
      kind: "evidence"
    });
  });
});
