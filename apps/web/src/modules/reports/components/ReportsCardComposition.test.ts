import decisionCardSource from "./DecisionCard.tsx?raw";
import reportFeedbackPanelSource from "./ReportFeedbackPanel.tsx?raw";
import reportSectionSource from "./ReportSection.tsx?raw";
import { describe, expect, it } from "vitest";

const reportsComponentSources = [
  {
    fileName: "DecisionCard.tsx",
    source: decisionCardSource
  },
  {
    fileName: "ReportSection.tsx",
    source: reportSectionSource
  },
  {
    fileName: "ReportFeedbackPanel.tsx",
    source: reportFeedbackPanelSource
  }
] as const;

describe("Reports card composition", () => {
  it.each(reportsComponentSources)(
    "keeps $fileName on shared card patterns instead of raw Ant Card shells",
    ({ source }) => {
      expect(source).not.toMatch(/import\s*\{[^}]*\bCard\b[^}]*\}\s*from\s*["']antd["']/);
      expect(source).toMatch(/ContentCard|CardSurface/);
    }
  );
});
