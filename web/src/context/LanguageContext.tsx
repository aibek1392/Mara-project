import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  translate,
  translateArray,
  categoryLabel,
  type Locale,
} from "../i18n";
import {
  applyDocumentLocale,
  loadLocale,
  saveLocale,
} from "../utils/localeStorage";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tArray: (key: string) => string[];
  category: (cat: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [locale, setLocaleState] = useState<Locale>(() => loadLocale(null));

  // When a user signs in, restore their saved language (if any).
  useEffect(() => {
    if (!user) return;
    const saved = loadLocale(user.id);
    setLocaleState(saved);
    applyDocumentLocale(saved);
    document.title = translate(saved, "meta.title");
  }, [user?.id]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      saveLocale(next, user?.id ?? null);
      applyDocumentLocale(next);
      document.title = translate(next, "meta.title");
    },
    [user?.id]
  );

  useEffect(() => {
    applyDocumentLocale(locale);
    document.title = translate(locale, "meta.title");
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  );

  const tArray = useCallback(
    (key: string) => translateArray(locale, key),
    [locale]
  );

  const category = useCallback(
    (cat: string) => categoryLabel(locale, cat),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, tArray, category }),
    [locale, setLocale, t, tArray, category]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
