import { Link } from "react-router-dom";
import type { CartItem } from "../types";
import {
  getEstimatedTax,
  getShippingCost,
  type DeliveryZone,
  type ShippingMethod,
} from "../utils/checkout";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice } from "../utils/format";

interface Props {
  items: CartItem[];
  subtotal: number;
  shippingMethod: ShippingMethod;
  deliveryZone?: DeliveryZone;
}

export function CheckoutSummary({ items, subtotal, shippingMethod, deliveryZone = "kyrgyzstan" }: Props) {
  const { t, locale } = useLanguage();
  const shipping = getShippingCost(subtotal, shippingMethod, deliveryZone);
  const tax = getEstimatedTax(subtotal);
  const total = subtotal + shipping + tax;

  return (
    <aside className="checkout-summary">
      <h2 className="checkout-summary-title">{t("checkout.summaryTitle")}</h2>
      <ul className="checkout-summary-items">
        {items.map((item) => (
          <li
            key={`${item.product.id}-${item.size}-${item.color}`}
            className="checkout-summary-item"
          >
            <img src={item.product.image} alt="" />
            <div>
              <p className="checkout-summary-name">{item.product.name}</p>
              <p className="checkout-summary-meta">
                {item.color} · {t("common.size")} {item.size} · {t("common.qty")} {item.quantity}
              </p>
              <p className="checkout-summary-price">
                {formatPrice(item.product.price * item.quantity, locale)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="checkout-summary-totals">
        <div className="checkout-summary-row">
          <span>{t("cart.subtotal")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="checkout-summary-row">
          <span>{t("cart.shipping")}</span>
          <span>{shipping === 0 ? t("common.free") : formatPrice(shipping, locale)}</span>
        </div>
        <div className="checkout-summary-row">
          <span>{t("checkout.tax")}</span>
          <span>{formatPrice(tax, locale)}</span>
        </div>
        <div className="checkout-summary-row checkout-summary-total">
          <span>{t("cart.total")}</span>
          <span>{formatPrice(total, locale)}</span>
        </div>
      </div>
      <Link to="/cart" className="checkout-edit-bag">
        {t("checkout.editCart")}
      </Link>
    </aside>
  );
}
