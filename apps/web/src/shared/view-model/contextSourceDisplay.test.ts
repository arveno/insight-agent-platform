import { describe, expect, it } from "vitest";

import { messages } from "../i18n/messages";
import {
  createContextSourceMetaText,
  formatContextSourceRoleLabel,
  formatContextSourceTypeLabel,
  normalizeContextSourceChipLabel
} from "./contextSourceDisplay";

const t = (key: keyof (typeof messages)["zh-CN"]) => messages["zh-CN"][key];

describe("contextSourceDisplay", () => {
  it("formats source type and role labels through i18n keys", () => {
    expect(formatContextSourceTypeLabel(t, "dataTable")).toBe("数据表");
    expect(formatContextSourceTypeLabel(t, "knowledgeDocument")).toBe("知识文档");
    expect(formatContextSourceTypeLabel(t, "report")).toBe("报告");
    expect(formatContextSourceTypeLabel(t, "sourceEvidence")).toBe("证据");
    expect(formatContextSourceRoleLabel(t, "primary_table")).toBe("主表");
    expect(formatContextSourceRoleLabel(t, "supporting_document")).toBe("支撑文档");
    expect(formatContextSourceRoleLabel(t, "supporting_report")).toBe("支撑报告");
    expect(formatContextSourceRoleLabel(t, "supporting_evidence")).toBe("支撑证据");
  });

  it("does not leak unknown raw enums", () => {
    expect(formatContextSourceTypeLabel(t, "mystery_type")).toBe("未知来源");
    expect(formatContextSourceRoleLabel(t, "mystery_role")).toBe("未知角色");
    expect(normalizeContextSourceChipLabel(t, "mystery_type")).toBeUndefined();
    expect(normalizeContextSourceChipLabel(t, "mystery_role")).toBeUndefined();
  });

  it("orders type before role when creating compact source meta text", () => {
    expect(createContextSourceMetaText(t, ["supporting_report", "report"])).toBe(
      "报告 · 支撑报告"
    );
    expect(createContextSourceMetaText(t, ["sourceEvidence", "supporting_evidence"])).toBe(
      "证据 · 支撑证据"
    );
    expect(createContextSourceMetaText(t, ["primary_table", "dataTable"])).toBe("数据表 · 主表");
    expect(createContextSourceMetaText(t, ["supporting_document", "knowledgeDocument"])).toBe(
      "知识文档 · 支撑文档"
    );
  });
});
