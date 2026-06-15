import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useProducts } from "../context/ProductContext";
import { getUsersByRole } from "../data/users";
import type { SellerBilling, User } from "../types";
import {
  loadSellerBilling,
  saveSellerBilling,
} from "../utils/sellerBilling";
import { buildSellerBillingReport } from "../utils/billingReport";
import { formatPrice } from "../utils/format";
import {
  getMarketDisplayName,
  getSellerFullName,
  loadSellerProfile,
} from "../utils/sellerProfile";
import { loadOrdersFromStorage } from "../utils/sellerAnalytics";

export function AccountantDashboard() {
  const { t, locale } = useLanguage();
  const { products } = useProducts();
  const [sellers, setSellers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [billing, setBilling] = useState<SellerBilling | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSellers(getUsersByRole("seller"));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setBilling(null);
      return;
    }
    setBilling(loadSellerBilling(selectedId));
  }, [selectedId]);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSaveBilling = (e: FormEvent) => {
    e.preventDefault();
    if (!billing) return;
    saveSellerBilling(billing);
    showMsg(t("accountant.billingSaved"));
  };

  const selected = sellers.find((s) => s.id === selectedId);
  const profile = selectedId ? loadSellerProfile(selectedId) : null;
  const marginReport = selectedId
    ? buildSellerBillingReport(selectedId, products, loadOrdersFromStorage())
    : null;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">{t("accountant.title")}</h1>
          <p style={{ color: "var(--grey-400)", marginTop: 4 }}>{t("accountant.subtitle")}</p>
        </div>
        <span className="badge badge-role">{t("roleAccess.accountant")}</span>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="admin-layout">
        <div className="card-panel">
          <h2>{t("accountant.sellersList")} ({sellers.length})</h2>
          <ul className="admin-seller-list">
            {sellers.map((s) => {
              const p = loadSellerProfile(s.id);
              const b = loadSellerBilling(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`admin-seller-item ${selectedId === s.id ? "active" : ""}`}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <strong>{p ? getSellerFullName(p) : s.name}</strong>
                    <span>
                      {b.yearlySubscriptionPaid ? "✓ " : ""}
                      {p ? getMarketDisplayName(p) : s.storeName ?? s.email}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card-panel">
          {!selected || !billing ? (
            <p style={{ color: "var(--grey-400)" }}>{t("accountant.selectSeller")}</p>
          ) : (
            <>
              <h2>{t("accountant.sellerInfo")}</h2>
              <dl className="spec-list" style={{ marginBottom: 24 }}>
                <div className="spec-row">
                  <dt>{t("common.name")}</dt>
                  <dd>{profile ? getSellerFullName(profile) : selected.name}</dd>
                </div>
                <div className="spec-row">
                  <dt>{t("common.email")}</dt>
                  <dd>{profile?.email || selected.email}</dd>
                </div>
                <div className="spec-row">
                  <dt>{t("seller.profile.phone")}</dt>
                  <dd>{profile?.phone || t("common.dash")}</dd>
                </div>
                <div className="spec-row">
                  <dt>{t("seller.profile.marketName")}</dt>
                  <dd>{profile ? getMarketDisplayName(profile) || t("common.dash") : selected.storeName ?? t("common.dash")}</dd>
                </div>
                <div className="spec-row">
                  <dt>{t("seller.profile.storeAddress")}</dt>
                  <dd>{profile?.storeAddress || t("common.dash")}</dd>
                </div>
                <div className="spec-row">
                  <dt>{t("seller.profile.returnAddress")}</dt>
                  <dd>{profile?.returnAddress || t("common.dash")}</dd>
                </div>
              </dl>

              <h2>{t("accountant.billingTitle")}</h2>
              <form onSubmit={handleSaveBilling}>
                <div className="seller-form-grid">
                  <div className="form-group form-group-check form-full">
                    <label>
                      <input
                        type="checkbox"
                        checked={billing.yearlySubscriptionPaid}
                        onChange={(e) => setBilling({ ...billing, yearlySubscriptionPaid: e.target.checked })}
                      />
                      {t("accountant.yearlySubscriptionPaid")}
                    </label>
                  </div>
                  <div className="form-group">
                    <label>{t("accountant.yearlyAmount")}</label>
                    <input
                      type="number"
                      min="0"
                      value={billing.yearlySubscriptionAmount}
                      onChange={(e) => setBilling({ ...billing, yearlySubscriptionAmount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("accountant.yearlyDate")}</label>
                    <input
                      type="date"
                      value={billing.yearlySubscriptionDate}
                      onChange={(e) => setBilling({ ...billing, yearlySubscriptionDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("accountant.photoshootItems")}</label>
                    <input
                      type="number"
                      min="0"
                      value={billing.photoshootItemCount}
                      onChange={(e) => setBilling({ ...billing, photoshootItemCount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("accountant.itemQuantity")}</label>
                    <input
                      type="number"
                      min="0"
                      value={billing.itemQuantity}
                      onChange={(e) => setBilling({ ...billing, itemQuantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group form-full">
                    <label>{t("accountant.photoshootDateTime")}</label>
                    <input
                      type="datetime-local"
                      value={billing.photoshootScheduledAt}
                      onChange={(e) => setBilling({ ...billing, photoshootScheduledAt: e.target.value })}
                    />
                  </div>
                  <div className="form-group form-full">
                    <label>{t("accountant.notes")}</label>
                    <textarea
                      rows={2}
                      value={billing.notes ?? ""}
                      onChange={(e) => setBilling({ ...billing, notes: e.target.value })}
                    />
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--grey-400)", marginTop: 8 }}>
                  {t("accountant.photoshootHint")}
                </p>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
                  {t("accountant.saveBilling")}
                </button>
              </form>

              {marginReport && (
                <>
                  <h2 style={{ marginTop: 32 }}>{t("accountant.marginReportTitle")}</h2>
                  <p className="seller-profile-sub">{t("accountant.marginReportSubtitle")}</p>
                  <div className="billing-report-summary">
                    <div className="stat-card analytics-metric">
                      <h3>{t("seller.billingReport.totalRevenue")}</h3>
                      <div className="stat-value">{formatPrice(marginReport.totalRevenue, locale)}</div>
                    </div>
                    <div className="stat-card analytics-metric">
                      <h3>{t("seller.billingReport.totalCost")}</h3>
                      <div className="stat-value">{formatPrice(marginReport.totalCost, locale)}</div>
                    </div>
                    <div className="stat-card analytics-metric">
                      <h3>{t("seller.billingReport.totalNetMargin")}</h3>
                      <div className="stat-value">{formatPrice(marginReport.totalNetMargin, locale)}</div>
                    </div>
                  </div>
                  {marginReport.products.length > 0 && (
                    <table className="data-table" style={{ marginTop: 16 }}>
                      <thead>
                        <tr>
                          <th>{t("seller.productName")}</th>
                          <th>{t("seller.billingReport.salePrice")}</th>
                          <th>{t("seller.costPrice")}</th>
                          <th>{t("seller.billingReport.marginPerUnit")}</th>
                          <th>{t("seller.billingReport.unitsSold")}</th>
                          <th>{t("seller.billingReport.netPerProduct")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marginReport.products.map((row) => (
                          <tr key={row.productId}>
                            <td>{row.productName}</td>
                            <td>{formatPrice(row.salePrice, locale)}</td>
                            <td>{row.costPrice > 0 ? formatPrice(row.costPrice, locale) : t("common.dash")}</td>
                            <td>
                              {row.costPrice > 0
                                ? formatPrice(row.marginPerUnit, locale)
                                : t("common.dash")}
                            </td>
                            <td>{row.unitsSold}</td>
                            <td><strong>{formatPrice(row.netMargin, locale)}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
