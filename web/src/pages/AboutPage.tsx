import { useLanguage } from "../context/LanguageContext";

export function AboutPage() {
  const { t } = useLanguage();

  return (
    <article className="static-page container" style={{ padding: "48px 16px 64px" }}>
      <h1>{t("about.title")}</h1>
      <p>{t("about.p1")}</p>
      <h2 id="careers" style={{ fontSize: "1.25rem", marginTop: 32 }}>{t("about.careers")}</h2>
      <p>{t("about.p2")}</p>
      <h2 id="sustainability" style={{ fontSize: "1.25rem", marginTop: 32 }}>{t("about.sustainability")}</h2>
      <p>{t("about.p3")}</p>
    </article>
  );
}
