import ru from "./locales/ru";
import en from "./locales/en";
import ky from "./locales/ky";
import type { Locale } from "./types";

export const translations = { ru, en, ky } as const;

export type { Locale, TranslationDict } from "./types";
export { LOCALES, LOCALE_STORAGE_KEY, LOCALE_BCP47 } from "./types";

type DictObject = { [key: string]: DictValue };
type DictValue = string | DictObject | readonly string[];

function isDictObject(value: DictValue): value is DictObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNested(dict: DictValue, path: string): string | undefined {
  const keys = path.split(".");
  let current: DictValue = dict;
  for (const key of keys) {
    if (typeof current === "string" || Array.isArray(current)) return undefined;
    if (!isDictObject(current)) return undefined;
    current = current[key];
    if (current === undefined) return undefined;
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[locale] as DictValue;
  let value = getNested(dict, key) ?? getNested(translations.ru as DictValue, key) ?? key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, String(v));
    });
  }
  return value;
}

export function translateArray(locale: Locale, key: string): string[] {
  const keys = key.split(".");
  let current: DictValue = translations[locale] as DictValue;
  for (const k of keys) {
    if (typeof current === "string" || Array.isArray(current)) break;
    if (!isDictObject(current)) break;
    current = current[k];
  }
  if (Array.isArray(current)) return [...current];
  let fallback: DictValue = translations.ru as DictValue;
  for (const k of keys) {
    if (typeof fallback === "string" || Array.isArray(fallback)) break;
    if (!isDictObject(fallback)) break;
    fallback = fallback[k];
  }
  return Array.isArray(fallback) ? [...fallback] : [];
}

export function categoryLabel(locale: Locale, category: string): string {
  return translate(locale, `categories.${category}`);
}
