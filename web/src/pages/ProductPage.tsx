import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductDetailSections } from "../components/ProductDetailSections";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { CATEGORY_FIELDS } from "../utils/categoryFields";
import { formatPrice } from "../utils/format";
import { getDiscountPercent, getProductImages, getProductStock, isInStock } from "../utils/productHelpers";

function renderStars(rating: number) {
  const full = Math.floor(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { getProduct } = useProducts();
  const product = id ? getProduct(id) : undefined;
  const { addItem } = useCart();
  const { t, category, locale } = useLanguage();
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const localeTag = locale === "en" ? "en-US" : locale === "ky" ? "ky-KG" : "ru-RU";

  if (!product) {
    return (
      <div className="empty-state">
        <h2>{t("product.notFound")}</h2>
        <Link to="/shop" className="btn btn-primary">
          {t("product.backToShop")}
        </Link>
      </div>
    );
  }

  const images = getProductImages(product);
  const stock = getProductStock(product);
  const inStock = isInStock(product);
  const discount = getDiscountPercent(product);
  const selectedSize = size || product.sizes[0] || "Универсальный";
  const selectedColor = color || product.colors[0] || "По умолчанию";
  const needsSelection = product.sizes.length > 1 || product.colors.length > 1;
  const categoryFields = CATEGORY_FIELDS[product.category];

  const handleAdd = () => {
    if (!inStock) return;
    addItem(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-detail">
      <div className="product-detail-gallery">
        <div className="product-detail-image">
          <img src={images[activeImage] ?? product.image} alt={product.name} />
          {discount > 0 && <span className="product-sale-badge">SALE! −{discount}%</span>}
        </div>
        {images.length > 1 && (
          <div className="product-detail-thumbs">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                className={`product-thumb ${activeImage === i ? "active" : ""}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="product-detail-info">
        <h1>{product.name}</h1>
        <div className="stars">
          {renderStars(product.rating)}
          <span className="stars-count">
            {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString(localeTag)} {t("product.reviewsCount")})
          </span>
        </div>
        <p className="product-detail-meta">
          {t("common.category")}: {category(product.category)}
        </p>
        {product.sellerName && (
          <p className="product-detail-meta">
            {t("product.soldBy")}: <strong>{product.sellerName}</strong>
          </p>
        )}
        {product.postalDropOff && (
          <span className="badge badge-success" style={{ marginBottom: 8 }}>{t("product.postalDropOff")}</span>
        )}
        <p className="product-detail-price">
          {formatPrice(product.price, locale)}
          {product.originalPrice && (
            <span className="product-detail-original">
              {t("common.was")}: {formatPrice(product.originalPrice, locale)}
            </span>
          )}
        </p>
        {product.prime && <span className="badge badge-prime">{t("product.primeDelivery")}</span>}

        {product.dimensions && (
          <div className="product-specs">
            <h3>{t("product.dimensions")}</h3>
            <p>
              {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {t("product.cm")}
              · {product.dimensions.weight} {t("product.kg")}
            </p>
          </div>
        )}

        {product.categoryAttributes && categoryFields.length > 0 && (
          <div className="product-specs">
            <h3>{t("product.specifications")}</h3>
            <dl className="spec-list">
              {categoryFields.map((field) => {
                const val = product.categoryAttributes?.[field.key];
                if (val === undefined || val === "") return null;
                return (
                  <div key={field.key} className="spec-row">
                    <dt>{t(`seller.categoryFields.${field.labelKey}`)}</dt>
                    <dd>{val}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        )}

        <p className="product-detail-shipping-note">{t("product.freeDeliveryNote")}</p>

        {product.sizes.length > 1 && (
          <div className="option-group">
            <label>{t("product.selectSize")}</label>
            <div className="option-pills">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`option-pill ${selectedSize === s ? "selected" : ""}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors.length > 1 && (
          <div className="option-group">
            <label>{t("product.selectColor")}</label>
            <div className="option-pills">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`option-pill ${selectedColor === c ? "selected" : ""}`}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="buy-box">
          <p style={{ fontSize: 18, color: "var(--deal-red)", marginBottom: 8 }}>
            {formatPrice(product.price, locale)}
          </p>
          <p style={{ fontSize: 13, color: inStock ? "#047857" : "var(--deal-red)", marginBottom: 12 }}>
            {inStock
              ? stock !== null
                ? t("product.inStockCount", { count: stock })
                : t("common.inStock")
              : t("common.outOfStock")}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", padding: "10px" }}
            onClick={handleAdd}
            disabled={!inStock}
          >
            {added ? t("product.addedToCart") : t("product.addToCart")}
          </button>
          {!needsSelection && (
            <p style={{ fontSize: 12, color: "var(--grey-400)", marginTop: 8 }}>
              {t("product.quickAdd")}
            </p>
          )}
        </div>

        <ProductDetailSections
          description={product.description}
          sellerName={product.sellerName}
        />
      </div>
    </div>
  );
}
