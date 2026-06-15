import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";
import { useLanguage } from "../context/LanguageContext";
import { ALL_CATEGORIES, type ProductCategory } from "../types";
import { pluralResults } from "../utils/format";

export function ShopPage() {
  const { category: catParam } = useParams<{ category?: string }>();
  const { getByCategory } = useProducts();
  const { t, category, locale } = useLanguage();

  const active = (catParam ?? "all") as ProductCategory | "all";
  const items = useMemo(() => getByCategory(active), [getByCategory, active]);

  const title =
    active === "all" ? t("shop.allProducts") : category(active);

  return (
    <>
      <div className="shop-header">
        <div className="container">
          <h1 className="section-title">{title}</h1>
          <p style={{ color: "var(--grey-400)", marginTop: 8 }}>
            {items.length} {pluralResults(items.length, locale)}
          </p>
          <div className="filter-bar">
            <Link
              to="/shop"
              className={`filter-btn ${active === "all" ? "active" : ""}`}
            >
              {t("common.all")}
            </Link>
            {ALL_CATEGORIES.map((c) => (
              <Link
                key={c}
                to={`/shop/${c}`}
                className={`filter-btn ${active === c ? "active" : ""}`}
              >
                {category(c)}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="container" style={{ padding: "24px 16px 64px" }}>
        <div className="product-grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}
