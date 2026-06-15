import { FormEvent, useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useOrders } from "../context/OrderContext";
import type { Order, OrderStatus } from "../types";
import { formatAddress } from "../utils/orderShipping";

const SHIPPING_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "ready_for_pickup",
  "at_warehouse",
  "assigned",
  "out_for_delivery",
  "delivered",
];

const ASSIGNABLE_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "ready_for_pickup",
  "at_warehouse",
  "assigned",
];

function canAssign(order: Order): boolean {
  return ASSIGNABLE_STATUSES.includes(order.status);
}

export function ShippingHubPanel() {
  const { t } = useLanguage();
  const {
    getOrdersForShipping,
    deliveryDrivers,
    addDeliveryDriver,
    updateOrderStatus,
    assignDriver,
    assignOrdersToDriver,
  } = useOrders();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all" | "unassigned">("all");
  const [bulkDriverId, setBulkDriverId] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [rowDriverPick, setRowDriverPick] = useState<Record<string, string>>({});
  const [assignMessage, setAssignMessage] = useState<string | null>(null);
  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "123456",
  });
  const [driverError, setDriverError] = useState("");
  const [driverSuccess, setDriverSuccess] = useState<string | null>(null);
  const [showAddDriver, setShowAddDriver] = useState(false);

  const allOrders = getOrdersForShipping();

  const unassignedOrders = useMemo(
    () => allOrders.filter((o) => canAssign(o) && !o.assignedDriverId),
    [allOrders]
  );

  const filtered = useMemo(() => {
    if (statusFilter === "unassigned") return unassignedOrders;
    if (statusFilter === "all") return allOrders;
    return allOrders.filter((o) => o.status === statusFilter);
  }, [allOrders, statusFilter, unassignedOrders]);

  const groupedByCity = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const order of filtered) {
      const city =
        order.shippingAddress?.deliveryZone === "almaty"
          ? "Almaty"
          : order.shippingAddress?.city || t("shipping.unknownCity");
      const key = `${order.shippingAddress?.deliveryZone ?? "—"} · ${city}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(order);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, t]);

  const stats = useMemo(
    () => ({
      total: allOrders.length,
      unassigned: unassignedOrders.length,
      assigned: allOrders.filter((o) => o.status === "assigned").length,
      drivers: deliveryDrivers.length,
    }),
    [allOrders, unassignedOrders.length, deliveryDrivers.length]
  );

  const defaultDriverId = deliveryDrivers[0]?.id ?? "";

  const handleRowAssign = (orderId: string) => {
    const driverId = rowDriverPick[orderId] || defaultDriverId;
    const driver = deliveryDrivers.find((d) => d.id === driverId);
    if (!driver) return;
    assignDriver(orderId, driver.id, driver.name);
    setAssignMessage(t("shipping.orderAssignedWithOtp", { orderId, driver: driver.name }));
  };

  const handleBulkAssign = () => {
    const driver = deliveryDrivers.find((d) => d.id === bulkDriverId);
    if (!driver || selectedOrderIds.size === 0) return;
    assignOrdersToDriver([...selectedOrderIds], driver.id, driver.name);
    setAssignMessage(
      t("shipping.bulkAssignedWithOtp", { count: selectedOrderIds.size, driver: driver.name })
    );
    setSelectedOrderIds(new Set());
    setBulkDriverId("");
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const selectAllUnassigned = () => {
    setSelectedOrderIds(new Set(unassignedOrders.map((o) => o.id)));
    setStatusFilter("unassigned");
  };

  const handleAddDriver = (e: FormEvent) => {
    e.preventDefault();
    setDriverError("");
    setDriverSuccess(null);
    try {
      const created = addDeliveryDriver(driverForm);
      setDriverSuccess(
        t("shipping.driverCreated", {
          name: created.name,
          email: created.email,
          password: driverForm.password || "123456",
        })
      );
      setDriverForm({ name: "", email: "", phone: "", password: "123456" });
      setShowAddDriver(false);
      setBulkDriverId(created.id);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "EMAIL_EXISTS") setDriverError(t("shipping.errors.emailExists"));
      else if (code === "PHONE_EXISTS") setDriverError(t("shipping.errors.phoneExists"));
      else if (code === "NAME_REQUIRED") setDriverError(t("shipping.errors.nameRequired"));
      else if (code === "EMAIL_INVALID") setDriverError(t("shipping.errors.emailInvalid"));
      else setDriverError(t("shipping.errors.generic"));
    }
  };

  return (
    <>
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>{t("shipping.statUnassigned")}</h3>
          <div className="stat-value">{stats.unassigned}</div>
        </div>
        <div className="stat-card">
          <h3>{t("shipping.statAssigned")}</h3>
          <div className="stat-value">{stats.assigned}</div>
        </div>
        <div className="stat-card">
          <h3>{t("shipping.statDrivers")}</h3>
          <div className="stat-value">{stats.drivers}</div>
        </div>
        <div className="stat-card">
          <h3>{t("shipping.statTotal")}</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
      </div>

      {deliveryDrivers.length > 0 && unassignedOrders.length > 0 && (
        <div className="card-panel shipping-assign-panel">
          <h2>{t("shipping.assignPanelTitle")}</h2>
          <p style={{ fontSize: 14, color: "var(--grey-400)", marginBottom: 16 }}>
            {t("shipping.assignPanelSub", { count: unassignedOrders.length })}
          </p>
          {assignMessage && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              {assignMessage}
            </div>
          )}
          <div className="shipping-bulk-assign">
            <button type="button" className="btn btn-secondary btn-sm" onClick={selectAllUnassigned}>
              {t("shipping.selectAllUnassigned")}
            </button>
            <span style={{ fontSize: 13, color: "var(--grey-500)" }}>
              {t("shipping.selectedCount", { count: selectedOrderIds.size })}
            </span>
            <select
              value={bulkDriverId}
              onChange={(e) => setBulkDriverId(e.target.value)}
              aria-label={t("shipping.selectDriver")}
            >
              <option value="">{t("shipping.selectDriver")}</option>
              {deliveryDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!bulkDriverId || selectedOrderIds.size === 0}
              onClick={handleBulkAssign}
            >
              {t("shipping.assignSelected")}
            </button>
          </div>
        </div>
      )}

      <div className="card-panel">
        <div className="shipping-drivers-header">
          <div>
            <h2>{t("shipping.driversTitle")}</h2>
            <p style={{ fontSize: 14, color: "var(--grey-400)", marginTop: 4 }}>
              {t("shipping.driversSub")}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setShowAddDriver(!showAddDriver);
              setDriverError("");
              setDriverSuccess(null);
            }}
          >
            {showAddDriver ? t("common.back") : t("shipping.addDriver")}
          </button>
        </div>

        {driverSuccess && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            {driverSuccess}
          </div>
        )}

        {showAddDriver && (
          <form className="shipping-add-driver-form" onSubmit={handleAddDriver}>
            <div className="seller-form-grid">
              <div className="form-group">
                <label htmlFor="driver-name">{t("common.name")}</label>
                <input
                  id="driver-name"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="driver-email">{t("common.email")}</label>
                <input
                  id="driver-email"
                  type="email"
                  value={driverForm.email}
                  onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="driver-phone">{t("shipping.phone")}</label>
                <input
                  id="driver-phone"
                  type="tel"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="driver-password">{t("common.password")}</label>
                <input
                  id="driver-password"
                  type="text"
                  value={driverForm.password}
                  onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                />
              </div>
            </div>
            {driverError && <p className="field-error">{driverError}</p>}
            <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
              {t("shipping.createDriver")}
            </button>
          </form>
        )}

        {deliveryDrivers.length === 0 ? (
          <p style={{ color: "var(--grey-400)", marginTop: 16 }}>{t("shipping.noDrivers")}</p>
        ) : (
          <table className="data-table" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>{t("common.name")}</th>
                <th>{t("common.email")}</th>
                <th>{t("shipping.phone")}</th>
                <th>{t("shipping.activeOrders")}</th>
              </tr>
            </thead>
            <tbody>
              {deliveryDrivers.map((driver) => {
                const active = allOrders.filter(
                  (o) => o.assignedDriverId === driver.id && o.status !== "delivered"
                ).length;
                return (
                  <tr key={driver.id}>
                    <td>{driver.name}</td>
                    <td>{driver.email}</td>
                    <td>{driver.phone ?? "—"}</td>
                    <td>{active}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card-panel">
        <h2 style={{ marginBottom: 16 }}>{t("shipping.ordersTitle")}</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter("all")}
          >
            {t("common.all")}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "unassigned" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter("unassigned")}
          >
            {t("shipping.filterUnassigned")} ({stats.unassigned})
          </button>
          {SHIPPING_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setStatusFilter(s)}
            >
              {t(`account.orderStatus.${s}`)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: "var(--grey-400)" }}>{t("shipping.noOrders")}</p>
        ) : deliveryDrivers.length === 0 ? (
          <p className="alert alert-error">{t("shipping.needDriverFirst")}</p>
        ) : (
          groupedByCity.map(([cityKey, cityOrders]) => (
            <div key={cityKey} className="shipping-route-group">
              <h2 className="shipping-route-title">
                {t("shipping.routeGroup")}: {cityKey}
                <span className="shipping-route-count">{cityOrders.length}</span>
              </h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }} />
                    <th>{t("shipping.recipient")}</th>
                    <th>{t("shipping.address")}</th>
                    <th>{t("seller.orderId")}</th>
                    <th>{t("shipping.status")}</th>
                    <th>{t("shipping.assignToDriver")}</th>
                  </tr>
                </thead>
                <tbody>
                  {cityOrders.map((order) => {
                    const assignable = canAssign(order);
                    return (
                      <tr key={order.id}>
                        <td>
                          {assignable && (
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.has(order.id)}
                              onChange={() => toggleOrderSelection(order.id)}
                              aria-label={t("shipping.selectOrder", { id: order.id })}
                            />
                          )}
                        </td>
                        <td>
                          <strong>{order.shippingAddress?.recipientName ?? order.userName}</strong>
                          <br />
                          <span style={{ fontSize: 12, color: "var(--grey-400)" }}>
                            {order.shippingAddress?.phone ?? "—"}
                          </span>
                        </td>
                        <td style={{ maxWidth: 220, fontSize: 13 }}>{formatAddress(order)}</td>
                        <td>{order.id}</td>
                        <td>
                          <span className="badge">{t(`account.orderStatus.${order.status}`)}</span>
                          {order.assignedDriverName && (
                            <p style={{ fontSize: 12, marginTop: 4, color: "var(--grey-500)" }}>
                              {order.assignedDriverName}
                            </p>
                          )}
                        </td>
                        <td>
                          {assignable ? (
                            <div className="shipping-assign-row">
                              {order.status === "ready_for_pickup" && (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => updateOrderStatus(order.id, "at_warehouse")}
                                >
                                  {t("shipping.receiveAtWarehouse")}
                                </button>
                              )}
                              <select
                                value={rowDriverPick[order.id] ?? order.assignedDriverId ?? defaultDriverId}
                                onChange={(e) =>
                                  setRowDriverPick({ ...rowDriverPick, [order.id]: e.target.value })
                                }
                              >
                                {deliveryDrivers.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleRowAssign(order.id)}
                              >
                                {order.assignedDriverId
                                  ? t("shipping.reassignDriver")
                                  : t("shipping.assign")}
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, color: "var(--grey-400)" }}>
                              {t("shipping.cannotAssign")}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </>
  );
}
