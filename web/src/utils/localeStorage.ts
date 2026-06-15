import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "../i18n/types";

function userLocaleKey(userId: string) {
  return `${LOCALE_STORAGE_KEY}_${userId}`;
}

export function isLocale(value: string | null): value is Locale {
  return value === "ky" || value === "ru" || value === "en";
}

/** Load saved language: per-user preference, then guest preference, then Kyrgyz. */
export function loadLocale(userId?: string | null): Locale {
  if (userId) {
    const perUser = localStorage.getItem(userLocaleKey(userId));
    if (isLocale(perUser)) return perUser;
  }
  const guest = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isLocale(guest)) return guest;
  return DEFAULT_LOCALE;
}

/** Persist language for this browser and optionally for a logged-in user. */
export function saveLocale(locale: Locale, userId?: string | null) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  if (userId) {
    localStorage.setItem(userLocaleKey(userId), locale);
  }
}

export function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale;
}
