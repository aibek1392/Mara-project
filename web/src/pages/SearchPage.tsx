import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";
import { useLanguage } from "../context/LanguageContext";
import { pluralResults } from "../utils/format";

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const { products } = useProducts();
  const { t, locale } = useLanguage();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query, products]);

  return (
    <div className="search-page">
      <div className="search-results-header">
        {query ? (
          <p>
            {results.length} {pluralResults(results.length, locale)} {t("search.resultsFor")}{" "}
            <strong>&quot;{query}&quot;</strong>
          </p>
        ) : (
          <p>{t("search.emptyHint")}</p>
        )}
      </div>
      <div className="container">
        {query && results.length === 0 && (
          <p style={{ color: "var(--grey-400)", padding: "24px 0" }}>
            {t("search.noResults", { query })}
          </p>
        )}
        <div className="product-grid">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
