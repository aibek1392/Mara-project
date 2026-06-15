import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useOrders } from "../context/OrderContext";
import { formatAddress } from "../utils/orderShipping";
import { formatPrice, roleLabel } from "../utils/format";

export function UserAccountPage() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">{t("account.title")}</h1>
          <p style={{ color: "var(--grey-400)", marginTop: 4 }}>{t("account.subtitle")}</p>
        </div>
        <span className="badge badge-role">{t("roleAccess.user")}</span>
      </div>

      <div className="dashboard-grid">
        <Link to="/account/orders" className="stat-card" style={{ textDecoration: "none" }}>
          <h3>{t("account.yourOrders")}</h3>
          <div className="stat-value" style={{ fontSize: 16, color: "var(--highlight)" }}>{t("account.trackPackages")}</div>
        </Link>
        <Link to="/cart" className="stat-card" style={{ textDecoration: "none" }}>
          <h3>{t("account.yourCart")}</h3>
          <div className="stat-value" style={{ fontSize: 16, color: "var(--highlight)" }}>{t("account.viewCart")}</div>
        </Link>
        <Link to="/shop" className="stat-card" style={{ textDecoration: "none" }}>
          <h3>{t("account.shopAll")}</h3>
          <div className="stat-value" style={{ fontSize: 16, color: "var(--highlight)" }}>{t("account.browse")}</div>
        </Link>
      </div>

      <div className="card-panel">
        <h2>{t("account.details")}</h2>
        <table className="data-table">
          <tbody>
            <tr>
              <td><strong>{t("common.name")}</strong></td>
              <td>{user?.name}</td>
            </tr>
            <tr>
              <td><strong>{t("common.email")}</strong></td>
              <td>{user?.email}</td>
            </tr>
            <tr>
              <td><strong>{t("account.accountType")}</strong></td>
              <td><span className="badge badge-role">{user ? roleLabel(locale, user.role) : ""}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card-panel">
        <h2>{t("account.primeBenefits")}</h2>
        <ul style={{ listStyle: "none", fontSize: 14, lineHeight: 2 }}>
          <li>{t("account.prime1")}</li>
          <li>{t("account.prime2")}</li>
          <li>{t("account.prime3")}</li>
          <li>{t("account.prime4")}</li>
        </ul>
      </div>
    </div>
  );
}

export function UserOrdersPage() {
  const { user } = useAuth();
  const { getOrdersForUser, requestReturn } = useOrders();
  const { t, locale } = useLanguage();

  const orders = user ? getOrdersForUser(user.id) : [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="section-title">{t("account.ordersTitle")}</h1>
        <Link to="/account" className="btn btn-secondary">{t("account.backToAccount")}</Link>
      </div>

      <div className="card-panel">
        {!user ? (
          <p>{t("account.signInOrders")}</p>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 0" }}>
            <h2>{t("account.noOrders")}</h2>
            <p style={{ color: "var(--grey-400)", marginBottom: 16 }}>{t("account.noOrdersHint")}</p>
            <Link to="/shop" className="btn btn-primary">{t("account.startShopping")}</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <strong>{t("account.order")} {order.id}</strong>
                    <p style={{ fontSize: 13, color: "var(--grey-400)", margin: "2px 0 0" }}>
                      {new Date(order.createdAt).toLocaleDateString(locale === "en" ? "en-US" : locale === "ky" ? "ky-KG" : "ru-RU")}
                    </p>
                  </div>
                  <span className="badge">{t(`account.orderStatus.${order.status}`)}</span>
                </div>
                {order.shippingAddress && (
                  <p style={{ fontSize: 13, color: "var(--grey-600)", marginBottom: 12 }}>
                    <strong>{t("account.deliveryAddress")}:</strong> {formatAddress(order)}
                  </p>
                )}
                {order.assignedDriverName && (
                  <p style={{ fontSize: 13, color: "var(--grey-400)", marginBottom: 12 }}>
                    {t("shipping.driver")}: {order.assignedDriverName}
                  </p>
                )}
                {order.deliveryOtp &&
                  (order.status === "assigned" || order.status === "out_for_delivery") && (
                    <div className="delivery-otp-box">
                      <p className="delivery-otp-label">{t("account.deliveryCode")}</p>
                      <p className="delivery-otp-code">{order.deliveryOtp}</p>
                      <p className="delivery-otp-hint">{t("account.deliveryCodeHint")}</p>
                    </div>
                  )}
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.productId}`} className="order-item">
                    <img src={item.image} alt="" className="order-item-img" />
                    <div className="order-item-info">
                      <strong>{item.productName}</strong>
                      <p style={{ fontSize: 13, color: "var(--grey-400)" }}>
                        {item.color} · {item.size} · ×{item.quantity}
                      </p>
                      <p>{formatPrice(item.price * item.quantity, locale)}</p>
                      {item.returnStatus === "requested" && (
                        <span className="badge badge-deal">{t("account.returnPending")}</span>
                      )}
                    </div>
                    {item.returnStatus === "none" && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => requestReturn(order.id, item.productId, user.id)}
                      >
                        {t("account.requestReturn")}
                      </button>
                    )}
                  </div>
                ))}
                <p className="order-total">{t("checkout.orderTotal")}: <strong>{formatPrice(order.total, locale)}</strong></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
