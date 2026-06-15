import type { MetricContextSource } from "@insight-agent/contracts/generated/typescript";

import { defaultLocale } from "../i18n/localeTypes";
import { messages } from "../i18n/messages";
import { translateKey, type Translate } from "../i18n/translateKey";

const contextSourceTypeKeyByValue: Record<MetricContextSource["sourceType"], string> = {
  dataTable: "context.sourceType.dataTable",
  knowledgeDocument: "context.sourceType.knowledgeDocument",
  report: "context.sourceType.report",
  sourceEvidence: "context.sourceType.sourceEvidence"
};

const contextSourceRoleKeyByValue: Record<MetricContextSource["role"], string> = {
  primary_table: "context.sourceRole.primaryTable",
  supporting_document: "context.sourceRole.supportingDocument",
  supporting_evidence: "context.sourceRole.supportingEvidence",
  supporting_report: "context.sourceRole.supportingReport"
};

const defaultTranslate: Translate = (key) => messages[defaultLocale][key];

function getContextSourceTypeKey(sourceType: string | null | undefined): string | undefined {
  if (!sourceType) {
    return undefined;
  }

  return contextSourceTypeKeyByValue[sourceType as MetricContextSource["sourceType"]];
}

function getContextSourceRoleKey(role: string | null | undefined): string | undefined {
  if (!role) {
    return undefined;
  }

  return contextSourceRoleKeyByValue[role as MetricContextSource["role"]];
}

function getTranslatedSourceTypeLabels(t: Translate): string[] {
  return Object.values(contextSourceTypeKeyByValue).map((key) => translateKey(t, key));
}

function getTranslatedSourceRoleLabels(t: Translate): string[] {
  return Object.values(contextSourceRoleKeyByValue).map((key) => translateKey(t, key));
}

function resolveSourceTypeLabel(t: Translate, chip: string | null | undefined): string | undefined {
  const key = getContextSourceTypeKey(chip);

  if (key) {
    return translateKey(t, key);
  }

  if (!chip) {
    return undefined;
  }

  return getTranslatedSourceTypeLabels(t).includes(chip) ? chip : undefined;
}

function resolveSourceRoleLabel(t: Translate, chip: string | null | undefined): string | undefined {
  const key = getContextSourceRoleKey(chip);

  if (key) {
    return translateKey(t, key);
  }

  if (!chip) {
    return undefined;
  }

  return getTranslatedSourceRoleLabels(t).includes(chip) ? chip : undefined;
}

/**
 * Shared Pattern：context source type 的用户可读文案。
 *
 * 调用方传入稳定 translate 函数；未知值统一回落到 unknown 文案，
 * 不向用户暴露 raw enum。
 */
export function formatContextSourceTypeLabel(
  t: Translate,
  sourceType: string | null | undefined
): string {
  return resolveSourceTypeLabel(t, sourceType) ?? translateKey(t, "context.sourceType.unknown");
}

/**
 * Shared Pattern：context source role 的用户可读文案。
 *
 * 调用方传入稳定 translate 函数；未知值统一回落到 unknown 文案，
 * 不向用户暴露 raw enum。
 */
export function formatContextSourceRoleLabel(
  t: Translate,
  role: string | null | undefined
): string {
  return resolveSourceRoleLabel(t, role) ?? translateKey(t, "context.sourceRole.unknown");
}

export function formatDefaultContextSourceTypeLabel(
  sourceType: string | null | undefined
): string {
  return formatContextSourceTypeLabel(defaultTranslate, sourceType);
}

export function formatDefaultContextSourceRoleLabel(role: string | null | undefined): string {
  return formatContextSourceRoleLabel(defaultTranslate, role);
}

/**
 * 把单个 chip 规范化为 context source 展示文案。
 *
 * 仅处理 source type / role；其他 chip 返回 undefined，
 * 由调用方决定是否显示，避免泄漏未知 raw enum。
 */
export function normalizeContextSourceChipLabel(
  t: Translate,
  chip: string | null | undefined
): string | undefined {
  return resolveSourceTypeLabel(t, chip) ?? resolveSourceRoleLabel(t, chip);
}

/**
 * 把一组 chips 压缩成稳定的 context source meta 文案。
 *
 * 只输出 `sourceType · sourceRole`，并固定 type 在前、role 在后。
 */
export function createContextSourceMetaText(
  t: Translate,
  chips: Array<string | null | undefined>
): string | undefined {
  const sourceTypeLabel = chips.map((chip) => resolveSourceTypeLabel(t, chip)).find(Boolean);
  const sourceRoleLabel = chips.map((chip) => resolveSourceRoleLabel(t, chip)).find(Boolean);
  const parts = [sourceTypeLabel, sourceRoleLabel].filter(
    (chip): chip is string => Boolean(chip)
  );

  return parts.length > 0 ? parts.join(" · ") : undefined;
}
