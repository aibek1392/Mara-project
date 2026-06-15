import { FormEvent, useMemo, useState } from "react";
import { ImageUploader } from "../components/ImageUploader";
import { SellerPerformanceSection } from "../components/SellerPerformanceSection";
import { SellerProfilePanel } from "../components/SellerProfilePanel";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { useProducts } from "../context/ProductContext";
import { useLanguage } from "../context/LanguageContext";
import { ALL_CATEGORIES, type Product, type ProductCategory } from "../types";
import { CATEGORY_FIELDS } from "../utils/categoryFields";
import { formatPrice } from "../utils/format";
import { calcSalePrice } from "../utils/productHelpers";
import { getMarketDisplayName, loadSellerProfile } from "../utils/sellerProfile";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

interface SellerForm {
  name: string;
  category: ProductCategory;
  basePrice: string;
  costPrice: string;
  discountPercent: string;
  description: string;
  colors: string;
  sizes: string;
  stock: string;
  images: string[];
  length: string;
  width: string;
  height: string;
  weight: string;
  postalDropOff: boolean;
  categoryAttributes: Record<string, string>;
}

const emptyForm = (): SellerForm => ({
  name: "",
  category: "electronics",
  basePrice: "",
  costPrice: "",
  discountPercent: "",
  description: "",
  colors: "По умолчанию",
  sizes: "Универсальный",
  stock: "",
  images: [],
  length: "",
  width: "",
  height: "",
  weight: "",
  postalDropOff: false,
  categoryAttributes: {},
});

function formFromProduct(p: Product): SellerForm {
  const basePrice = p.originalPrice ?? p.price;
  const discount =
    p.discountPercent ??
    (p.originalPrice && p.originalPrice > p.price
      ? Math.round((1 - p.price / p.originalPrice) * 100)
      : 0);

  const attrs: Record<string, string> = {};
  if (p.categoryAttributes) {
    Object.entries(p.categoryAttributes).forEach(([k, v]) => {
      attrs[k] = String(v);
    });
  }

  return {
    name: p.name,
    category: p.category,
    basePrice: String(basePrice),
    costPrice: p.costPrice !== undefined ? String(p.costPrice) : "",
    discountPercent: discount > 0 ? String(discount) : "",
    description: p.description,
    colors: p.colors.join(", "),
    sizes: p.sizes.join(", "),
    stock: p.stock !== undefined ? String(p.stock) : "",
    images: p.images?.length ? [...p.images] : p.image ? [p.image] : [],
    length: p.dimensions ? String(p.dimensions.length) : "",
    width: p.dimensions ? String(p.dimensions.width) : "",
    height: p.dimensions ? String(p.dimensions.height) : "",
    weight: p.dimensions ? String(p.dimensions.weight) : "",
    postalDropOff: p.postalDropOff ?? false,
    categoryAttributes: attrs,
  };
}

function buildProduct(form: SellerForm, user: { id: string; storeName?: string; name: string }, editingId?: string): Product {
  const profile = loadSellerProfile(user.id);
  const marketName = profile ? getMarketDisplayName(profile) : "";
  const sellerDisplayName = marketName || user.storeName || user.name;

  const basePrice = parseFloat(form.basePrice);
  const discount = form.discountPercent ? parseFloat(form.discountPercent) : 0;
  const salePrice = discount > 0 ? calcSalePrice(basePrice, discount) : basePrice;

  const categoryAttributes: Record<string, string | number> = {};
  CATEGORY_FIELDS[form.category].forEach((field) => {
    const val = form.categoryAttributes[field.key]?.trim();
    if (val) {
      categoryAttributes[field.key] = field.type === "number" ? Number(val) : val;
    }
  });

  const hasDimensions =
    form.length.trim() && form.width.trim() && form.height.trim() && form.weight.trim();

  const images = form.images.length > 0 ? form.images : [DEFAULT_IMAGE];
  const costPrice = form.costPrice.trim() ? parseFloat(form.costPrice) : undefined;

  return {
    id: editingId ?? `seller-${user.id}-${Date.now()}`,
    name: form.name,
    category: form.category,
    price: salePrice,
    costPrice: costPrice !== undefined && !isNaN(costPrice) ? costPrice : undefined,
    originalPrice: discount > 0 ? basePrice : undefined,
    discountPercent: discount > 0 ? discount : undefined,
    image: images[0],
    images,
    description: form.description,
    rating: 4.0,
    reviewCount: 0,
    prime: false,
    sellerId: user.id,
    sellerName: sellerDisplayName,
    colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
    sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    stock: form.stock ? parseInt(form.stock, 10) : undefined,
    dimensions: hasDimensions
      ? {
          length: parseFloat(form.length),
          width: parseFloat(form.width),
          height: parseFloat(form.height),
          weight: parseFloat(form.weight),
        }
      : undefined,
    categoryAttributes: Object.keys(categoryAttributes).length > 0 ? categoryAttributes : undefined,
    postalDropOff: form.postalDropOff,
  };
}

export function SellerDashboard() {
  const { user } = useAuth();
  const {
    products,
    getSellerProducts,
    getRawSellerProduct,
    addProduct,
    updateProduct,
    removeProduct,
  } = useProducts();
  const {
    getOrdersForSeller,
    getNotificationsForSeller,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    markPostalDropOff,
  } = useOrders();
  const { t, category, locale } = useLanguage();

  const [form, setForm] = useState<SellerForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const myProducts = user ? getSellerProducts(user.id) : [];
  const myOrders = user ? getOrdersForSeller(user.id) : [];
  const notifications = user ? getNotificationsForSeller(user.id) : [];
  const unread = user ? unreadNotificationCount(user.id) : 0;

  const categoryFields = CATEGORY_FIELDS[form.category];

  const previewPrice = useMemo(() => {
    const base = parseFloat(form.basePrice);
    const disc = parseFloat(form.discountPercent);
    if (!base || isNaN(base)) return null;
    if (!disc || isNaN(disc) || disc <= 0) return { base, sale: base, discount: 0 };
    return { base, sale: calcSalePrice(base, disc), discount: disc };
  }, [form.basePrice, form.discountPercent]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
  };

  const startEdit = (id: string) => {
    const raw = getRawSellerProduct(id);
    if (!raw) return;
    setForm(formFromProduct(raw));
    setEditingId(id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (cat: ProductCategory) => {
    setForm({ ...form, category: cat, categoryAttributes: {} });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.images.length === 0) {
      setError(t("seller.needPhoto"));
      return;
    }
    if (!form.description.trim()) {
      setError(t("seller.descriptionRequired"));
      return;
    }

    const product = buildProduct(form, user, editingId ?? undefined);
    if (editingId) {
      updateProduct(product);
      showMessage(t("seller.productUpdated"));
    } else {
      addProduct(product);
      showMessage(t("seller.productListed"));
    }
    resetForm();
  };

  const sellerOrderItems = myOrders.flatMap((order) =>
    order.items
      .filter((item) => item.sellerId === user?.id)
      .map((item) => ({ order, item }))
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">{t("seller.title")}</h1>
          <p style={{ color: "var(--grey-400)", marginTop: 4 }}>
            {t("seller.welcome", { store: user?.storeName ?? user?.name ?? "" })}
          </p>
        </div>
        <span className="badge badge-role">{t("roleAccess.seller")}</span>
      </div>

      <SellerProfilePanel />

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>{t("seller.yourListings")}</h3>
          <div className="stat-value">{myProducts.length}</div>
        </div>
        <div className="stat-card">
          <h3>{t("seller.ordersCount")}</h3>
          <div className="stat-value">{sellerOrderItems.length}</div>
        </div>
        <div className="stat-card">
          <h3>{t("seller.notifications")}</h3>
          <div className="stat-value">{unread > 0 ? unread : "0"}</div>
          {unread > 0 && (
            <span className="badge badge-deal" style={{ marginTop: 8 }}>{t("seller.unread")}</span>
          )}
        </div>
        <div className="stat-card">
          <h3>{t("seller.storeName")}</h3>
          <div className="stat-value" style={{ fontSize: 18 }}>
            {user?.storeName ?? t("common.dash")}
          </div>
        </div>
      </div>

      {user && <SellerPerformanceSection user={user} products={products} />}

      {message && <div className="alert alert-success">{message}</div>}

      {notifications.length > 0 && (
        <div className="card-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2>{t("seller.notifications")}</h2>
            {unread > 0 && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => user && markAllNotificationsRead(user.id)}>
                {t("seller.markAllRead")}
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.slice(0, 10).map((n) => (
              <div
                key={n.id}
                className={`notification-item ${n.read ? "" : "unread"}`}
                onClick={() => markNotificationRead(n.id)}
              >
                <span className={`notification-icon ${n.type === "return_requested" ? "return" : "order"}`}>
                  {n.type === "return_requested" ? "↩" : "📦"}
                </span>
                <div>
                  <strong>
                    {n.type === "return_requested"
                      ? t("seller.notifReturn", { product: n.productName })
                      : t("seller.notifOrder", { product: n.productName })}
                  </strong>
                  <p style={{ fontSize: 13, color: "var(--grey-400)", margin: "2px 0 0" }}>
                    {t("seller.notifCustomer", { name: n.customerName })} · {t("seller.orderId")}: {n.orderId}
                  </p>
                </div>
                {!n.read && <span className="notification-dot" />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-panel">
        <h2>{editingId ? t("seller.editProduct") : t("seller.addProduct")}</h2>
        {editingId && (
          <button type="button" className="btn btn-secondary btn-sm" style={{ marginBottom: 12 }} onClick={resetForm}>
            {t("seller.cancelEdit")}
          </button>
        )}
        <form onSubmit={handleSubmit}>
          <ImageUploader
            images={form.images}
            onChange={(images) => setForm({ ...form, images })}
          />

          <div className="seller-form-grid">
            <div className="form-group">
              <label htmlFor="name">{t("seller.productName")}</label>
              <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="category">{t("common.category")}</label>
              <select id="category" value={form.category} onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{category(c)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="basePrice">{t("seller.basePrice")}</label>
              <input id="basePrice" type="number" step="1" min="0" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="costPrice">{t("seller.costPrice")}</label>
              <input id="costPrice" type="number" step="1" min="0" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
              <p className="field-hint">{t("seller.costPriceHint")}</p>
            </div>
            <div className="form-group">
              <label htmlFor="discountPercent">{t("seller.salePercent")}</label>
              <input id="discountPercent" type="number" step="1" min="0" max="90" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} placeholder="0" />
              {previewPrice && previewPrice.discount > 0 && (
                <p className="sale-preview">
                  <span className="badge badge-deal">SALE! −{previewPrice.discount}%</span>
                  {" "}{formatPrice(previewPrice.sale, locale)}{" "}
                  <span style={{ textDecoration: "line-through", color: "var(--grey-400)" }}>
                    {formatPrice(previewPrice.base, locale)}
                  </span>
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="stock">{t("seller.quantity")}</label>
              <input id="stock" type="number" step="1" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder={t("seller.quantityHint")} />
            </div>
            <div className="form-group form-group-check">
              <label>
                <input type="checkbox" checked={form.postalDropOff} onChange={(e) => setForm({ ...form, postalDropOff: e.target.checked })} />
                {t("seller.postalDropOff")}
              </label>
              <p className="field-hint">{t("seller.postalDropOffHint")}</p>
            </div>

            <div className="form-group">
              <label htmlFor="colors">{t("seller.colors")}</label>
              <input id="colors" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="sizes">{t("seller.sizes")}</label>
              <input id="sizes" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
            </div>
          </div>

          <fieldset className="seller-fieldset">
            <legend>{t("seller.dimensions")}</legend>
            <div className="seller-form-grid seller-form-grid-4">
              <div className="form-group">
                <label htmlFor="length">{t("seller.length")}</label>
                <input id="length" type="number" step="0.1" min="0" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} placeholder="см" />
              </div>
              <div className="form-group">
                <label htmlFor="width">{t("seller.width")}</label>
                <input id="width" type="number" step="0.1" min="0" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} placeholder="см" />
              </div>
              <div className="form-group">
                <label htmlFor="height">{t("seller.height")}</label>
                <input id="height" type="number" step="0.1" min="0" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="см" />
              </div>
              <div className="form-group">
                <label htmlFor="weight">{t("seller.weight")}</label>
                <input id="weight" type="number" step="0.01" min="0" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="кг" />
              </div>
            </div>
          </fieldset>

          <fieldset className="seller-fieldset">
            <legend>{t("seller.descriptions")}</legend>
            <p className="field-hint">{t(`seller.descriptionHints.${form.category}`)}</p>
            <div className="form-group form-full">
              <label htmlFor="description">{t("seller.description")}</label>
              <textarea
                id="description"
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                placeholder={t("seller.descriptionHint")}
              />
            </div>
          </fieldset>

          {categoryFields.length > 0 && (
            <fieldset className="seller-fieldset">
              <legend>{t("seller.categoryInfo", { category: category(form.category) })}</legend>
              <div className="seller-form-grid">
                {categoryFields.map((field) => (
                  <div key={field.key} className="form-group">
                    <label htmlFor={`attr-${field.key}`}>{t(`seller.categoryFields.${field.labelKey}`)}</label>
                    <input
                      id={`attr-${field.key}`}
                      type={field.type}
                      value={form.categoryAttributes[field.key] ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          categoryAttributes: { ...form.categoryAttributes, [field.key]: e.target.value },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          )}

          {error && <p className="field-error">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
            {editingId ? t("seller.saveProduct") : t("seller.listProduct")}
          </button>
        </form>
      </div>

      <div className="card-panel">
        <h2>{t("seller.yourProducts")} ({myProducts.length})</h2>
        {myProducts.length === 0 ? (
          <p style={{ color: "var(--grey-400)" }}>{t("seller.noProducts")}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("seller.productName")}</th>
                <th>{t("common.category")}</th>
                <th>{t("seller.descriptions")}</th>
                <th>{t("common.price")}</th>
                <th>{t("seller.costPrice")}</th>
                <th>{t("seller.billingReport.marginPerUnit")}</th>
                <th>{t("seller.quantity")}</th>
                <th>{t("seller.sale")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((p) => {
                const disc = p.discountPercent ?? (p.originalPrice && p.originalPrice > p.price
                  ? Math.round((1 - p.price / p.originalPrice) * 100) : 0);
                const margin =
                  p.costPrice !== undefined ? Math.round((p.price - p.costPrice) * 100) / 100 : null;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img src={p.image} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                        {p.name}
                      </div>
                    </td>
                    <td>{category(p.category)}</td>
                    <td className="seller-description-cell" title={p.description}>
                      {p.description.trim()
                        ? p.description.length > 80
                          ? `${p.description.slice(0, 80)}…`
                          : p.description
                        : t("common.dash")}
                    </td>
                    <td>
                      {formatPrice(p.price, locale)}
                      {disc > 0 && <span className="badge badge-deal" style={{ marginLeft: 6 }}>−{disc}%</span>}
                    </td>
                    <td>{p.costPrice !== undefined ? formatPrice(p.costPrice, locale) : t("common.dash")}</td>
                    <td>
                      {margin !== null ? (
                        <span className={margin >= 0 ? "margin-positive" : "margin-negative"}>
                          {formatPrice(margin, locale)}
                        </span>
                      ) : (
                        t("common.dash")
                      )}
                    </td>
                    <td>
                      {p.stock !== undefined ? (
                        <span className={p.stock <= 3 ? "stock-low" : ""}>{p.stock}</span>
                      ) : (
                        t("common.dash")
                      )}
                    </td>
                    <td>{disc > 0 ? `SALE! −${disc}%` : t("common.dash")}</td>
                    <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(p.id)}>
                        {t("common.edit")}
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeProduct(p.id)}>
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card-panel">
        <h2>{t("seller.orders")}</h2>
        {sellerOrderItems.length === 0 ? (
          <p style={{ color: "var(--grey-400)" }}>{t("seller.noOrders")}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("seller.orderId")}</th>
                <th>{t("seller.productName")}</th>
                <th>{t("seller.customer")}</th>
                <th>{t("shipping.address")}</th>
                <th>{t("shipping.status")}</th>
                <th>{t("seller.qty")}</th>
                <th>{t("seller.postalStatus")}</th>
                <th>{t("seller.returnStatus")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {sellerOrderItems.map(({ order, item }) => (
                <tr key={`${order.id}-${item.productId}`}>
                  <td>{order.id}</td>
                  <td>{item.productName}</td>
                  <td>{order.userName}</td>
                  <td style={{ fontSize: 12, maxWidth: 180 }}>
                    {order.shippingAddress?.recipientName ?? order.userName}
                    <br />
                    <span style={{ color: "var(--grey-400)" }}>
                      {order.shippingAddress?.address ?? "—"}
                    </span>
                  </td>
                  <td>
                    <span className="badge">{t(`account.orderStatus.${order.status}`)}</span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>
                    {item.postalDroppedOff ? (
                      <span className="badge badge-success">{t("seller.postalDropped")}</span>
                    ) : (
                      <span className="badge">{t("seller.postalPending")}</span>
                    )}
                  </td>
                  <td>
                    {item.returnStatus === "requested" ? (
                      <span className="badge badge-deal">{t("seller.returnRequested")}</span>
                    ) : (
                      t("common.dash")
                    )}
                  </td>
                  <td>
                    {!item.postalDroppedOff && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => markPostalDropOff(order.id, item.productId)}
                      >
                        {t("seller.markPostalDropOff")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
