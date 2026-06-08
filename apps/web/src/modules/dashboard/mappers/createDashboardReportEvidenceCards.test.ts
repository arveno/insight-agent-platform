import { describe, expect, it, vi } from "vitest";

import { dashboardStaticViewModel } from "../fixtures/dashboardStaticViewModel";
import { createDashboardReportEvidenceCards } from "./createDashboardReportEvidenceCards";

describe("createDashboardReportEvidenceCards", () => {
  it("flattens reports and evidence entrances into one card list", () => {
    const onNavigate = vi.fn();
    const cards = createDashboardReportEvidenceCards({
      evidenceEntrances: dashboardStaticViewModel.evidenceEntrances,
      onNavigate,
      recentReports: dashboardStaticViewModel.recentReports,
      t: (key) => key
    });

    expect(cards).toHaveLength(3);
    expect(cards.map((card) => card.key)).toEqual([
      "weekly-business-report",
      "metric-revenue-evidence",
      "quality-job-evidence"
    ]);
    expect(cards.map((card) => card.eyebrow)).toEqual([
      "dashboard.reportEvidence.recentReportEyebrow",
      "dashboard.reportEvidence.evidenceEyebrow",
      "dashboard.reportEvidence.evidenceEyebrow"
    ]);
    expect(cards.map((card) => card.actions)).toHaveLength(3);
    expect(cards[0]?.actions).toHaveLength(3);
    expect(cards[1]?.actions).toHaveLength(3);
    expect(cards[2]?.actions).toHaveLength(3);
  });
});
