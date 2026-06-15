import { useLanguage } from "../context/LanguageContext";
import { LOCALES, type Locale } from "../i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className={`lang-switcher ${compact ? "lang-switcher-compact" : ""}`}>
      {!compact && (
        <span className="lang-switcher-label">{t("header.language")}:</span>
      )}
      <div className="lang-switcher-buttons">
        {LOCALES.map(({ code }) => (
          <button
            key={code}
            type="button"
            className={`lang-btn ${locale === code ? "active" : ""}`}
            onClick={() => setLocale(code as Locale)}
            aria-label={t(`languages.${code}`)}
            title={t(`languages.${code}`)}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
