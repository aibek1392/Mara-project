import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ALL_CATEGORIES } from "../types";

export function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { t, category } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const accountLink = user
    ? user.role === "owner"
      ? "/owner"
      : user.role === "admin"
        ? "/admin"
        : user.role === "accountant"
          ? "/accountant"
          : user.role === "seller"
            ? "/seller"
            : user.role === "shipping_manager"
              ? "/owner?tab=shipping"
              : user.role === "delivery_driver"
                ? "/driver"
                : "/account"
    : "/login";

  const accountLabel = user
    ? user.role === "owner"
      ? t("header.ownerPanel")
      : user.role === "admin"
        ? t("header.adminPanel")
        : user.role === "accountant"
          ? t("header.accountantPanel")
          : user.role === "seller"
            ? t("header.sellerCentral")
            : user.role === "shipping_manager"
              ? t("header.ownerPanel")
              : user.role === "delivery_driver"
                ? t("header.driverPanel")
                : t("header.myAccount")
    : t("header.signIn");

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-top-inner">
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t("header.menu")}
          >
            ☰
          </button>

          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            Door<span>2 Door</span>
          </Link>

          <LanguageSwitcher compact />

          <div className="deliver-to">
            <span className="label">{t("header.deliverTo")}</span>
            <span className="location">{t("header.location")}</span>
          </div>

          <form className="search-bar" onSubmit={handleSearch}>
            <select className="search-category" defaultValue="all" aria-label={t("header.searchCategory")}>
              <option value="all">{t("common.all")}</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {category(c)}
                </option>
              ))}
            </select>
            <input
              className="search-input"
              type="search"
              placeholder={t("header.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label={t("header.search")}>
              🔍
            </button>
          </form>

          <Link to={accountLink} className="header-account">
            <span className="label">
              {t("header.hello")}, {user ? user.name.split(" ")[0] : t("header.signInPrompt")}
            </span>
            <span className="name">{accountLabel}</span>
          </Link>

          <Link to="/account/orders" className="header-orders">
            <span className="label">{t("header.returns")}</span>
            <span className="text">{t("header.andOrders")}</span>
          </Link>

          <Link to="/cart" className="cart-link">
            <span className="cart-icon">🛒</span>
            {count > 0 && <span className="cart-count">{count}</span>}
            <span className="cart-label">{t("header.cart")}</span>
          </Link>
        </div>
      </div>

      <div className="header-subnav">
        <div className="header-subnav-inner">
          <Link to="/shop" className="subnav-all">
            ☰ {t("common.all")}
          </Link>
          {ALL_CATEGORIES.slice(0, 10).map((c) => (
            <Link key={c} to={`/shop/${c}`} className="subnav-link">
              {category(c)}
            </Link>
          ))}
          <Link to="/shop" className="subnav-link deals">
            {t("header.todaysDeals")}
          </Link>
          {user?.role === "owner" && (
            <Link to="/owner" className="subnav-link admin">
              {t("header.ownerPanel")}
            </Link>
          )}
          {user?.role === "shipping_manager" && (
            <Link to="/owner?tab=shipping" className="subnav-link admin">
              {t("header.shippingPanel")}
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="subnav-link admin">
              {t("header.adminPanel")}
            </Link>
          )}
          {user?.role === "accountant" && (
            <Link to="/accountant" className="subnav-link admin">
              {t("header.accountantPanel")}
            </Link>
          )}
          {user?.role === "seller" && (
            <Link to="/seller" className="subnav-link admin">
              {t("header.sellerCentral")}
            </Link>
          )}
          {user && (
            <button
              type="button"
              className="subnav-link"
              onClick={logout}
              style={{ background: "none", color: "inherit" }}
            >
              {t("header.signOut")}
            </button>
          )}
        </div>
      </div>

      <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <LanguageSwitcher />
        <Link to="/shop" onClick={() => setMenuOpen(false)}>
          {t("header.allProducts")}
        </Link>
        {ALL_CATEGORIES.map((c) => (
          <Link key={c} to={`/shop/${c}`} onClick={() => setMenuOpen(false)}>
            {category(c)}
          </Link>
        ))}
        <Link to={accountLink} onClick={() => setMenuOpen(false)}>
          {accountLabel}
        </Link>
        <Link to="/cart" onClick={() => setMenuOpen(false)}>
          {t("header.cart")} ({count})
        </Link>
        {user ? (
          <button type="button" onClick={() => { logout(); setMenuOpen(false); }}>
            {t("header.signOut")}
          </button>
        ) : (
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            {t("header.signIn")}
          </Link>
        )}
      </nav>
    </header>
  );
}
