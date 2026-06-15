import { Link } from "react-router-dom";
import type { Product } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice } from "../utils/format";
import { getDiscountPercent } from "../utils/productHelpers";

interface Props {
  product: Product;
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
}

export function ProductCard({ product }: Props) {
  const { t, category, locale } = useLanguage();

  const discount = getDiscountPercent(product);

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card-info">
        <h3>{product.name}</h3>
        <div className="stars">
          {renderStars(product.rating)}
          <span className="stars-count">
            ({product.reviewCount.toLocaleString(locale === "en" ? "en-US" : locale === "ky" ? "ky-KG" : "ru-RU")})
          </span>
        </div>
        <div className="price-row">
          <span className="price">{formatPrice(product.price, locale)}</span>
          {product.originalPrice && (
            <span className="original-price">{formatPrice(product.originalPrice, locale)}</span>
          )}
        </div>
        <span className="category">{category(product.category)}</span>
        <div className="product-card-badges">
          {product.prime && <span className="badge badge-prime">{t("common.prime")}</span>}
          {discount > 0 && <span className="badge badge-deal">SALE! −{discount}%</span>}
          {product.postalDropOff && <span className="badge badge-success">{t("product.postalShort")}</span>}
        </div>
      </div>
    </Link>
  );
}
