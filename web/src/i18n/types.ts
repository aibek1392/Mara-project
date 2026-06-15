export type Locale = "ky" | "ru" | "en";

export type TranslationDict = typeof import("./locales/ky").default;

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "ky", label: "Кыргызча" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export const LOCALE_STORAGE_KEY = "door2door_locale";

export const DEFAULT_LOCALE: Locale = "ky";

export const LOCALE_BCP47: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
  ky: "ky-KG",
};

export const CURRENCY_CODE = "KGS";

export const CURRENCY_LABEL: Record<Locale, string> = {
  ru: "сом",
  en: "som",
  ky: "сом",
};
