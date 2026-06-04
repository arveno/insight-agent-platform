import type { I18nMessageKey } from "../../shared";

export type Translate = (key: I18nMessageKey) => string;

export function translateKey(t: Translate, key: string): string {
  return t(key as I18nMessageKey);
}
