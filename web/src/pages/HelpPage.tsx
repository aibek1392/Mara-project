import { useLanguage } from "../context/LanguageContext";

export function HelpPage() {
  const { t } = useLanguage();

  return (
    <article className="static-page container" style={{ padding: "48px 16px 64px" }}>
      <h1>{t("help.title")}</h1>
      <h2 id="shipping" style={{ fontSize: "1.25rem", marginTop: 24 }}>{t("help.shipping")}</h2>
      <p>{t("help.shippingText")}</p>
      <h2 id="returns" style={{ fontSize: "1.25rem", marginTop: 24 }}>{t("help.returns")}</h2>
      <p>{t("help.returnsText")}</p>
      <h2 id="contact" style={{ fontSize: "1.25rem", marginTop: 24 }}>{t("help.contact")}</h2>
      <p>{t("help.contactText")}</p>
    </article>
  );
}
