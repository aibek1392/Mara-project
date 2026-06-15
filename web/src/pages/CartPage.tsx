import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice, pluralItems } from "../utils/format";

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { t, locale } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h2>{t("cart.empty")}</h2>
        <p>{t("cart.emptyHint")}</p>
        <Link to="/shop" className="btn btn-primary">
          {t("cart.continueShopping")}
        </Link>
      </div>
    );
  }

  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const shipping = subtotal >= 15000 ? 0 : 800;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <h1 className="section-title" style={{ marginBottom: 24 }}>
        {t("cart.title")} ({itemCount} {pluralItems(itemCount, locale)})
      </h1>
      <p className="cart-delivery-note">{t("cart.deliveryNote")}</p>

      {items.map((item) => (
        <div
          key={`${item.product.id}-${item.size}-${item.color}`}
          className="cart-item"
        >
          <img src={item.product.image} alt={item.product.name} />
          <div>
            <h3>{item.product.name}</h3>
            <p style={{ fontSize: 14, color: "var(--grey-400)" }}>
              {item.color} · {t("common.size")} {item.size}
            </p>
            <p style={{ fontWeight: 500, marginTop: 4 }}>
              {formatPrice(item.product.price, locale)}
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
              <button
                type="button"
                className="option-pill"
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.size,
                    item.color,
                    item.quantity - 1
                  )
                }
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                className="option-pill"
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.size,
                    item.color,
                    item.quantity + 1
                  )
                }
              >
                +
              </button>
              <button
                type="button"
                style={{ marginLeft: 12, fontSize: 13, textDecoration: "underline" }}
                onClick={() =>
                  removeItem(item.product.id, item.size, item.color)
                }
              >
                {t("common.remove")}
              </button>
            </div>
          </div>
          <p style={{ fontWeight: 600 }}>
            {formatPrice(item.product.price * item.quantity, locale)}
          </p>
        </div>
      ))}

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>{t("cart.subtotal")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="cart-summary-row">
          <span>{t("cart.shipping")}</span>
          <span>
            {shipping === 0
              ? t("common.free")
              : `${t("cart.shippingFrom")} ${formatPrice(shipping, locale)}`}
          </span>
        </div>
        <div className="cart-summary-total">
          <span>{t("cart.total")}</span>
          <span>{formatPrice(total, locale)}</span>
        </div>
        <Link to="/checkout" className="btn btn-primary" style={{ width: "100%" }}>
          {t("cart.checkout")}
        </Link>
        <button
          type="button"
          style={{ marginTop: 16, fontSize: 13, textDecoration: "underline", width: "100%" }}
          onClick={clearCart}
        >
          {t("cart.clear")}
        </button>
      </div>
    </div>
  );
}
