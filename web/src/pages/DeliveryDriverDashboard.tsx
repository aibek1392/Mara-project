import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useOrders } from "../context/OrderContext";
import type { OrderStatus } from "../types";
import { getDriverDeliveryDetails } from "../utils/orderShipping";

export function DeliveryDriverDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { getOrdersForDriver, updateOrderStatus, confirmDelivery } = useOrders();
  const [sortBy, setSortBy] = useState<"route" | "name">("route");
  const [confirmForms, setConfirmForms] = useState<
    Record<string, { recipientName: string; code: string }>
  >({});
  const [confirmErrors, setConfirmErrors] = useState<Record<string, string>>({});
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);

  const myOrders = user ? getOrdersForDriver(user.id) : [];

  const sorted = useMemo(() => {
    const list = [...myOrders];
    if (sortBy === "name") {
      list.sort((a, b) =>
        (a.shippingAddress?.recipientName ?? a.userName).localeCompare(
          b.shippingAddress?.recipientName ?? b.userName
        )
      );
    }
    return list;
  }, [myOrders, sortBy]);

  const updateConfirmForm = (
    orderId: string,
    patch: Partial<{ recipientName: string; code: string }>
  ) => {
    setConfirmForms((prev) => ({
      ...prev,
      [orderId]: {
        recipientName: prev[orderId]?.recipientName ?? "",
        code: prev[orderId]?.code ?? "",
        ...patch,
      },
    }));
    setConfirmErrors((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  };

  const handleConfirmDelivery = (e: FormEvent, orderId: string) => {
    e.preventDefault();
    if (!user) return;
    const form = confirmForms[orderId] ?? { recipientName: "", code: "" };
    const result = confirmDelivery(orderId, user.id, form.recipientName, form.code);

    if (result === "ok") {
      setConfirmSuccess(t("driver.deliveryConfirmed", { orderId }));
      setConfirmErrors((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      setConfirmForms((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      return;
    }

    const errorKey =
      result === "wrong_code"
        ? "driver.errors.wrongCode"
        : result === "wrong_name"
          ? "driver.errors.wrongName"
          : result === "wrong_status"
            ? "driver.errors.wrongStatus"
            : "driver.errors.generic";

    setConfirmErrors((prev) => ({ ...prev, [orderId]: t(errorKey) }));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">{t("driver.title")}</h1>
          <p style={{ color: "var(--grey-400)", marginTop: 4 }}>{t("driver.subtitle")}</p>
        </div>
        <span className="badge badge-role">{t("roleAccess.delivery_driver")}</span>
      </div>

      {confirmSuccess && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          {confirmSuccess}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>{t("driver.assignedCount")}</h3>
          <div className="stat-value">{myOrders.length}</div>
        </div>
        <div className="stat-card">
          <h3>{t("driver.outForDelivery")}</h3>
          <div className="stat-value">
            {myOrders.filter((o) => o.status === "out_for_delivery").length}
          </div>
        </div>
      </div>

      <div className="card-panel">
        <p className="driver-otp-hint">{t("driver.otpHint")}</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button
            type="button"
            className={`btn btn-sm ${sortBy === "route" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSortBy("route")}
          >
            {t("driver.sortByRoute")}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${sortBy === "name" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSortBy("name")}
          >
            {t("driver.sortByName")}
          </button>
        </div>

        {sorted.length === 0 ? (
          <p style={{ color: "var(--grey-400)" }}>{t("driver.noAssignments")}</p>
        ) : (
          <div className="driver-route-list">
            {sorted.map((order, index) => {
              const delivery = getDriverDeliveryDetails(order);
              const form = confirmForms[order.id] ?? { recipientName: "", code: "" };
              const isOutForDelivery = order.status === "out_for_delivery";
              const isAssigned = order.status === "assigned";

              return (
                <div key={order.id} className="driver-stop-card">
                  <div className="driver-stop-num">{index + 1}</div>
                  <div className="driver-stop-body">
                    <div className="driver-stop-header">
                      <span className="badge">{t(`account.orderStatus.${order.status}`)}</span>
                      <span className="driver-order-id">{order.id}</span>
                    </div>

                    <div className="driver-delivery-box">
                      <p className="driver-delivery-label">{t("driver.deliverTo")}</p>
                      <p className="driver-recipient-name">{delivery.recipientName}</p>
                      <div className="driver-address-lines">
                        <p>{delivery.streetLine}</p>
                        <p>{delivery.cityLine}</p>
                        <p className="driver-zone">{delivery.zoneLabel}</p>
                      </div>
                      <p className="driver-delivery-phone">
                        {t("shipping.phone")}:{" "}
                        {delivery.phone !== "—" ? (
                          <a href={`tel:${delivery.phone.replace(/\s/g, "")}`}>{delivery.phone}</a>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>

                    <p className="driver-items-heading">{t("driver.itemsToDeliver")}</p>
                    <ul className="driver-stop-items">
                      {order.items.map((item) => (
                        <li
                          key={`${item.productId}-${item.size}-${item.color}`}
                          className="driver-item-row"
                        >
                          <img src={item.image} alt="" className="driver-item-img" />
                          <div className="driver-item-info">
                            <strong>{item.productName}</strong>
                            <span>
                              {t("common.qty")}: {item.quantity} · {t("common.color")}: {item.color}{" "}
                              · {t("common.size")}: {item.size}
                            </span>
                            {item.sellerName && (
                              <span className="driver-item-seller">
                                {t("common.seller")}: {item.sellerName}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {isAssigned && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: 12 }}
                        onClick={() =>
                          updateOrderStatus(order.id, "out_for_delivery" as OrderStatus)
                        }
                      >
                        {t("driver.startDelivery")}
                      </button>
                    )}

                    {isOutForDelivery && (
                      <form
                        className="driver-confirm-form"
                        onSubmit={(e) => handleConfirmDelivery(e, order.id)}
                      >
                        <p className="driver-confirm-title">{t("driver.confirmDelivery")}</p>
                        <p className="driver-confirm-sub">{t("driver.confirmDeliverySub")}</p>
                        <div className="form-group">
                          <label htmlFor={`name-${order.id}`}>{t("driver.recipientNameInput")}</label>
                          <input
                            id={`name-${order.id}`}
                            value={form.recipientName}
                            onChange={(e) =>
                              updateConfirmForm(order.id, { recipientName: e.target.value })
                            }
                            placeholder={delivery.recipientName}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`code-${order.id}`}>{t("driver.deliveryCodeInput")}</label>
                          <input
                            id={`code-${order.id}`}
                            inputMode="numeric"
                            maxLength={6}
                            value={form.code}
                            onChange={(e) =>
                              updateConfirmForm(order.id, {
                                code: e.target.value.replace(/\D/g, "").slice(0, 6),
                              })
                            }
                            placeholder="123456"
                            required
                          />
                        </div>
                        {confirmErrors[order.id] && (
                          <p className="field-error">{confirmErrors[order.id]}</p>
                        )}
                        <button type="submit" className="btn btn-primary btn-sm">
                          {t("driver.completeDelivery")}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
