import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CheckoutSummary } from "../components/CheckoutSummary";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useOrders } from "../context/OrderContext";
import { useProducts } from "../context/ProductContext";
import {
  emptyCheckoutForm,
  getEstimatedDeliveryKey,
  getEstimatedTax,
  getShippingCost,
  type CheckoutFormData,
} from "../utils/checkout";
import { formatPrice } from "../utils/format";

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const { decrementStock } = useProducts();
  const { t, tArray, locale } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CheckoutFormData>(emptyCheckoutForm);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = tArray("checkout.steps");
  const shipping = getShippingCost(subtotal, form.shippingMethod, form.deliveryZone);
  const tax = getEstimatedTax(subtotal);
  const total = subtotal + shipping + tax;

  const update = (patch: Partial<CheckoutFormData>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors({});
  };

  if (items.length === 0 && !orderNumber) {
    return <Navigate to="/" replace />;
  }

  if (orderNumber) {
    return (
      <div className="checkout-confirm">
        <div className="checkout-confirm-icon">✓</div>
        <h1>{t("checkout.thankYou")}</h1>
        <p className="checkout-confirm-order">
          {t("checkout.order")} <strong>{orderNumber}</strong>
        </p>
        <p>
          {t("checkout.confirmSent")}{" "}
          <strong>{form.email}</strong>.
        </p>
        <p style={{ color: "var(--grey-400)", marginTop: 8 }}>
          {t(getEstimatedDeliveryKey(form.deliveryZone, form.shippingMethod))}
        </p>
        <div className="checkout-confirm-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate("/shop")}>
            {t("cart.continueShopping")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
            {t("checkout.backHome")}
          </button>
        </div>
      </div>
    );
  }

  const validateDelivery = (e: Record<string, string>) => {
    if (!form.email.trim()) e.email = t("checkout.errors.email");
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t("checkout.errors.emailInvalid");
    if (!form.firstName.trim()) e.firstName = t("checkout.errors.firstName");
    if (!form.lastName.trim()) e.lastName = t("checkout.errors.lastName");
    if (!form.deliveryZone) e.deliveryZone = t("checkout.errors.deliveryZone");
    if (!form.address.trim()) e.address = t("checkout.errors.address");
    if (form.deliveryZone === "kyrgyzstan" && !form.city.trim()) e.city = t("checkout.errors.city");
    if (!form.phone.trim()) e.phone = t("checkout.errors.phone");
  };

  const validatePayment = (e: Record<string, string>) => {
    if (!form.cardName.trim()) e.cardName = t("checkout.errors.cardName");
    if (!form.cardNumber.match(/^\d{16}$/)) e.cardNumber = t("checkout.errors.cardNumber");
    if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) e.cardExpiry = t("checkout.errors.cardExpiry");
    if (!form.cardCvc.match(/^\d{3,4}$/)) e.cardCvc = t("checkout.errors.cardCvc");
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) validateDelivery(e);
    if (step === 2) validatePayment(e);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateAll = (): boolean => {
    const e: Record<string, string> = {};
    validateDelivery(e);
    validatePayment(e);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) setStep(step + 1);
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/cart");
  };

  const placeOrderHandler = () => {
    if (!validateAll()) return;
    const userId = user?.id ?? `guest-${form.email}`;
    const userName = user?.name ?? `${form.firstName} ${form.lastName}`.trim();
    const orderId = placeOrder({ userId, userName, items, total, shipping: form });
    items.forEach((item) => {
      if (item.product.sellerId && item.product.stock !== undefined) {
        decrementStock(item.product.id, item.quantity);
      }
    });
    setOrderNumber(orderId);
    clearCart();
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button type="button" className="checkout-back" onClick={back}>
          ← {step === 0 ? t("checkout.cartBack") : t("common.back")}
        </button>
        <h1>{t("checkout.title")}</h1>
      </div>

      <div className="checkout-steps" aria-label={t("checkout.progress")}>
        {steps.map((label, i) => (
          <div
            key={label}
            className={`checkout-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
          >
            <span className="checkout-step-num">{i + 1}</span>
            <span className="checkout-step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 0 && (
            <section className="checkout-section">
              <h2>{t("checkout.deliveryTitle")}</h2>
              <p className="checkout-section-sub">{t("checkout.deliverySub")}</p>
              <p className="checkout-delivery-areas">{t("checkout.deliveryAreas")}</p>

              <fieldset className="checkout-zone-fieldset">
                <legend>{t("checkout.deliveryZone")}</legend>
                <label className={`checkout-radio ${form.deliveryZone === "kyrgyzstan" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="deliveryZone"
                    checked={form.deliveryZone === "kyrgyzstan"}
                    onChange={() => update({ deliveryZone: "kyrgyzstan", city: form.city === "Almaty" || form.city === "Алматы" ? "" : form.city })}
                  />
                  <div>
                    <strong>{t("checkout.zoneKyrgyzstan")}</strong>
                    <p>{t("checkout.zoneKyrgyzstanDesc")}</p>
                  </div>
                </label>
                <label className={`checkout-radio ${form.deliveryZone === "almaty" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="deliveryZone"
                    checked={form.deliveryZone === "almaty"}
                    onChange={() => update({ deliveryZone: "almaty", city: locale === "en" ? "Almaty" : "Алматы", state: locale === "en" ? "Almaty" : "Алматы" })}
                  />
                  <div>
                    <strong>{t("checkout.zoneAlmaty")}</strong>
                    <p>{t("checkout.zoneAlmatyDesc")}</p>
                  </div>
                </label>
              </fieldset>
              {errors.deliveryZone && <span className="field-error">{errors.deliveryZone}</span>}

              <div className="checkout-field">
                <label htmlFor="email">{t("common.email")}</label>
                <input id="email" type="email" value={form.email} onChange={(ev) => update({ email: ev.target.value })} className={errors.email ? "invalid" : ""} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="checkout-row">
                <div className="checkout-field">
                  <label htmlFor="firstName">{t("checkout.firstName")}</label>
                  <input id="firstName" value={form.firstName} onChange={(ev) => update({ firstName: ev.target.value })} className={errors.firstName ? "invalid" : ""} />
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>
                <div className="checkout-field">
                  <label htmlFor="lastName">{t("checkout.lastName")}</label>
                  <input id="lastName" value={form.lastName} onChange={(ev) => update({ lastName: ev.target.value })} className={errors.lastName ? "invalid" : ""} />
                  {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                </div>
              </div>
              <div className="checkout-field">
                <label htmlFor="address">{t("checkout.address")}</label>
                <input id="address" value={form.address} onChange={(ev) => update({ address: ev.target.value })} className={errors.address ? "invalid" : ""} />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>
              <div className="checkout-field">
                <label htmlFor="apartment">{t("checkout.apartment")}</label>
                <input id="apartment" value={form.apartment} onChange={(ev) => update({ apartment: ev.target.value })} />
              </div>
              <div className="checkout-row checkout-row-3">
                {form.deliveryZone === "kyrgyzstan" ? (
                  <>
                    <div className="checkout-field">
                      <label htmlFor="city">{t("checkout.city")}</label>
                      <input id="city" value={form.city} onChange={(ev) => update({ city: ev.target.value })} placeholder={t("checkout.cityPlaceholder")} className={errors.city ? "invalid" : ""} />
                      {errors.city && <span className="field-error">{errors.city}</span>}
                    </div>
                    <div className="checkout-field">
                      <label htmlFor="state">{t("checkout.region")}</label>
                      <input id="state" value={form.state} onChange={(ev) => update({ state: ev.target.value })} placeholder={t("checkout.regionPlaceholder")} />
                    </div>
                    <div className="checkout-field">
                      <label htmlFor="zip">{t("checkout.postalCode")}</label>
                      <input id="zip" value={form.zip} onChange={(ev) => update({ zip: ev.target.value })} placeholder={t("checkout.optional")} />
                    </div>
                  </>
                ) : (
                  <div className="checkout-field" style={{ gridColumn: "1 / -1" }}>
                    <label>{t("checkout.zoneAlmaty")}</label>
                    <p style={{ fontSize: 14, color: "var(--grey-600)", margin: 0 }}>
                      {t("checkout.almatyAddressHint")}
                    </p>
                  </div>
                )}
              </div>
              <div className="checkout-field">
                <label htmlFor="phone">{t("checkout.phone")}</label>
                <input id="phone" type="tel" value={form.phone} onChange={(ev) => update({ phone: ev.target.value })} className={errors.phone ? "invalid" : ""} />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="checkout-section">
              <h2>{t("checkout.shippingTitle")}</h2>
              <p className="checkout-section-sub">{t("checkout.shippingSub")}</p>
              <label className={`checkout-radio ${form.shippingMethod === "standard" ? "selected" : ""}`}>
                <input type="radio" name="shipping" checked={form.shippingMethod === "standard"} onChange={() => update({ shippingMethod: "standard" })} />
                <div>
                  <strong>{t("checkout.standard")}</strong>
                  <p>
                    {t(getEstimatedDeliveryKey(form.deliveryZone, "standard"))} ·{" "}
                    {subtotal >= (form.deliveryZone === "almaty" ? 20000 : 15000)
                      ? t("common.free")
                      : formatPrice(getShippingCost(subtotal, "standard", form.deliveryZone), locale)}
                  </p>
                </div>
              </label>
              <label className={`checkout-radio ${form.shippingMethod === "express" ? "selected" : ""}`}>
                <input type="radio" name="shipping" checked={form.shippingMethod === "express"} onChange={() => update({ shippingMethod: "express" })} />
                <div>
                  <strong>{t("checkout.express")}</strong>
                  <p>
                    {t(getEstimatedDeliveryKey(form.deliveryZone, "express"))} ·{" "}
                    {formatPrice(getShippingCost(subtotal, "express", form.deliveryZone), locale)}
                  </p>
                </div>
              </label>
            </section>
          )}

          {step === 2 && (
            <section className="checkout-section">
              <h2>{t("checkout.paymentTitle")}</h2>
              <p className="checkout-section-sub">{t("checkout.paymentSub")}</p>
              <div className="checkout-field">
                <label htmlFor="cardName">{t("checkout.cardName")}</label>
                <input id="cardName" value={form.cardName} onChange={(ev) => update({ cardName: ev.target.value })} className={errors.cardName ? "invalid" : ""} />
                {errors.cardName && <span className="field-error">{errors.cardName}</span>}
              </div>
              <div className="checkout-field">
                <label htmlFor="cardNumber">{t("checkout.cardNumber")}</label>
                <input id="cardNumber" placeholder="4242 4242 4242 4242" value={form.cardNumber} onChange={(ev) => update({ cardNumber: ev.target.value.replace(/\D/g, "").slice(0, 16) })} className={errors.cardNumber ? "invalid" : ""} />
                {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
              </div>
              <div className="checkout-row">
                <div className="checkout-field">
                  <label htmlFor="cardExpiry">{t("checkout.cardExpiry")}</label>
                  <input id="cardExpiry" placeholder="12/28" value={form.cardExpiry} onChange={(ev) => update({ cardExpiry: ev.target.value })} className={errors.cardExpiry ? "invalid" : ""} />
                  {errors.cardExpiry && <span className="field-error">{errors.cardExpiry}</span>}
                </div>
                <div className="checkout-field">
                  <label htmlFor="cardCvc">{t("checkout.cardCvc")}</label>
                  <input id="cardCvc" value={form.cardCvc} onChange={(ev) => update({ cardCvc: ev.target.value.replace(/\D/g, "").slice(0, 4) })} className={errors.cardCvc ? "invalid" : ""} />
                  {errors.cardCvc && <span className="field-error">{errors.cardCvc}</span>}
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="checkout-section">
              <h2>{t("checkout.reviewTitle")}</h2>
              <div className="checkout-review-block">
                <h3>{t("checkout.deliveryTitle")}</h3>
                <p>{form.firstName} {form.lastName}<br />{form.address}{form.apartment ? `, ${form.apartment}` : ""}<br />
                  {form.deliveryZone === "almaty"
                    ? t("checkout.zoneAlmaty")
                    : `${form.city}${form.state ? `, ${form.state}` : ""}${form.zip ? ` ${form.zip}` : ""}`}
                  <br />{form.email} · {form.phone}</p>
              </div>
              <div className="checkout-review-block">
                <h3>{t("checkout.deliveryZone")}</h3>
                <p>{form.deliveryZone === "almaty" ? t("checkout.zoneAlmaty") : t("checkout.zoneKyrgyzstan")}</p>
              </div>
              <div className="checkout-review-block">
                <h3>{t("checkout.reviewShippingMethod")}</h3>
                <p>{form.shippingMethod === "express" ? t("checkout.express") : t("checkout.standard")} — {t(getEstimatedDeliveryKey(form.deliveryZone, form.shippingMethod))}</p>
              </div>
              <div className="checkout-review-block">
                <h3>{t("checkout.reviewPayment")}</h3>
                <p>{form.cardName}<br />{t("checkout.cardEnding")}{form.cardNumber.slice(-4)}</p>
              </div>
              <p className="checkout-review-total">{t("checkout.orderTotal")}: <strong>{formatPrice(total, locale)}</strong></p>
            </section>
          )}

          <div className="checkout-actions">
            {step < steps.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={next}>{t("common.continue")}</button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={placeOrderHandler}>{t("checkout.placeOrder")} · {formatPrice(total, locale)}</button>
            )}
          </div>
        </div>

        <CheckoutSummary items={items} subtotal={subtotal} shippingMethod={form.shippingMethod} deliveryZone={form.deliveryZone} />
      </div>
    </div>
  );
}
