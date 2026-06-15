import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { ALL_CATEGORIES } from "../types";

export function Footer() {
  const { t, category } = useLanguage();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <button type="button" className="footer-back-top" onClick={scrollTop}>
        {t("footer.backToTop")}
      </button>
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h4>{t("footer.knowUs")}</h4>
            <ul>
              <li><Link to="/about">{t("footer.about")}</Link></li>
              <li><Link to="/about">{t("footer.careers")}</Link></li>
              <li><Link to="/about">{t("footer.press")}</Link></li>
              <li><Link to="/about">{t("footer.science")}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t("footer.makeMoney")}</h4>
            <ul>
              <li><Link to="/login">{t("footer.sell")}</Link></li>
              <li><Link to="/seller">{t("header.sellerCentral")}</Link></li>
              <li><Link to="/about">{t("footer.affiliate")}</Link></li>
              <li><Link to="/about">{t("footer.advertise")}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t("footer.payment")}</h4>
            <ul>
              <li><Link to="/help">{t("footer.rewards")}</Link></li>
              <li><Link to="/help">{t("footer.storeCard")}</Link></li>
              <li><Link to="/help">{t("footer.points")}</Link></li>
              <li><Link to="/help">{t("footer.reload")}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t("footer.helpYou")}</h4>
            <ul>
              <li><Link to="/help">{t("footer.yourAccount")}</Link></li>
              <li><Link to="/account/orders">{t("footer.yourOrders")}</Link></li>
              <li><Link to="/help">{t("footer.shippingRates")}</Link></li>
              <li><Link to="/help">{t("footer.returnsReplace")}</Link></li>
              <li><Link to="/help">{t("footer.help")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-logo">Door 2 Door</div>
          <p>
            {ALL_CATEGORIES.slice(0, 6).map((c) => category(c)).join(" · ")}
          </p>
          <p style={{ marginTop: 8 }}>{t("footer.copyright")}</p>
        </div>
      </footer>
    </>
  );
}
