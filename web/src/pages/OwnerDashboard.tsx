import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { createUser, loadUsers } from "../data/users";
import { SellerAnalyticsPanel } from "../components/SellerAnalyticsPanel";
import { DepartmentSellerRankings } from "../components/DepartmentSellerRankings";
import { ShippingHubPanel } from "../components/ShippingHubPanel";
import { ALL_CATEGORIES } from "../types";
import { formatPrice, roleLabel } from "../utils/format";
import { generateOwnerOtp, getActiveOwnerOtp } from "../utils/ownerOtp";
import { loadOwnerSettings, saveOwnerSettings } from "../utils/sellerBilling";

type OwnerTab = "business" | "shipping";
type StaffRole = "admin" | "accountant" | "shipping_manager";

export function OwnerDashboard() {
  const { user, isRole } = useAuth();
  const { products } = useProducts();
  const { t, category, locale } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const isOwner = isRole("owner");
  const isShippingManager = isRole("shipping_manager");

  const tabParam = searchParams.get("tab");
  const activeTab: OwnerTab =
    isShippingManager || tabParam === "shipping" ? "shipping" : "business";

  const [users, setUsers] = useState(loadUsers());
  const [ownerPhone, setOwnerPhone] = useState(loadOwnerSettings().phone);
  const [activeOtp, setActiveOtp] = useState(getActiveOwnerOtp());
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "123456" });
  const [accountantForm, setAccountantForm] = useState({ name: "", email: "", password: "123456" });
  const [shippingManagerForm, setShippingManagerForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "123456",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = () => setUsers(loadUsers());
  const sellers = users.filter((u) => u.role === "seller");
  const customers = users.filter((u) => u.role === "user");
  const staff = users.filter(
    (u) => u.role === "admin" || u.role === "accountant" || u.role === "shipping_manager"
  );
  const sellerProducts = products.filter((p) => p.sellerId);

  const categoryCounts = ALL_CATEGORIES.map((cat) => ({
    cat,
    count: products.filter((p) => p.category === cat).length,
  }));

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const setTab = (tab: OwnerTab) => {
    if (tab === "shipping") setSearchParams({ tab: "shipping" });
    else setSearchParams({});
  };

  const savePhone = (e: FormEvent) => {
    e.preventDefault();
    saveOwnerSettings({ phone: ownerPhone });
    showMsg(t("owner.phoneSaved"));
  };

  const sendOtp = () => {
    saveOwnerSettings({ phone: ownerPhone });
    const record = generateOwnerOtp(ownerPhone);
    setActiveOtp(record);
    showMsg(t("owner.otpSent", { phone: ownerPhone }));
  };

  const staffCreatedMessage = (role: StaffRole) => {
    if (role === "admin") return t("owner.adminCreated");
    if (role === "accountant") return t("owner.accountantCreated");
    return t("owner.shippingManagerCreated");
  };

  const createStaff = (
    role: StaffRole,
    form: { name: string; email: string; password: string; phone?: string }
  ) => {
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError(t("owner.errors.required"));
      return;
    }
    try {
      createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password || "123456",
        role,
        phone: form.phone?.trim() || undefined,
      });
      refresh();
      showMsg(staffCreatedMessage(role));
      if (role === "admin") setAdminForm({ name: "", email: "", password: "123456" });
      else if (role === "accountant") {
        setAccountantForm({ name: "", email: "", password: "123456" });
      } else {
        setShippingManagerForm({ name: "", email: "", phone: "", password: "123456" });
      }
    } catch {
      setError(t("owner.errors.emailExists"));
    }
  };

  const roleBadge = isOwner
    ? t("roleAccess.owner")
    : isShippingManager
      ? t("roleAccess.shipping_manager")
      : "";

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">{t("owner.title")}</h1>
          <p style={{ color: "var(--grey-400)", marginTop: 4 }}>
            {isShippingManager
              ? t("owner.shippingWelcome", { name: user?.name ?? "" })
              : t("owner.welcome", { name: user?.name ?? "" })}
          </p>
        </div>
        <span className="badge badge-role">{roleBadge}</span>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {isOwner && (
        <div className="owner-tabs">
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "business" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTab("business")}
          >
            {t("owner.tabBusiness")}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "shipping" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTab("shipping")}
          >
            {t("owner.tabShipping")}
          </button>
        </div>
      )}

      {activeTab === "shipping" ? (
        <>
          <div className="card-panel" style={{ marginBottom: 16 }}>
            <h2>{t("shipping.title")}</h2>
            <p style={{ fontSize: 14, color: "var(--grey-400)", marginTop: 4 }}>
              {t("shipping.subtitle")}
            </p>
          </div>
          <ShippingHubPanel />
        </>
      ) : (
        <>
          <SellerAnalyticsPanel sellers={sellers} products={products} />

          <DepartmentSellerRankings sellers={sellers} products={products} />

          <div className="owner-staff-grid">
            <div className="card-panel">
              <h2>{t("owner.otpPanel")}</h2>
              <p className="seller-profile-sub">{t("owner.otpPanelHint")}</p>
              <form onSubmit={savePhone} className="seller-form-grid" style={{ marginBottom: 12 }}>
                <div className="form-group form-full">
                  <label htmlFor="owner-phone">{t("owner.ownerPhone")}</label>
                  <input
                    id="owner-phone"
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+996 …"
                  />
                </div>
                <button type="submit" className="btn btn-secondary btn-sm">
                  {t("owner.savePhone")}
                </button>
              </form>
              <button type="button" className="btn btn-primary" onClick={sendOtp}>
                {t("owner.sendOtp")}
              </button>
              {activeOtp && (
                <div className="otp-display">
                  <p>{t("owner.otpDemo", { phone: activeOtp.phone })}</p>
                  <div className="otp-code">{activeOtp.code}</div>
                  <p style={{ fontSize: 12, color: "var(--grey-400)" }}>{t("owner.otpExpires")}</p>
                </div>
              )}
            </div>

            <div className="card-panel">
              <h2>{t("owner.createAdmin")}</h2>
              <p className="seller-profile-sub">{t("owner.createAdminHint")}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createStaff("admin", adminForm);
                }}
              >
                <div className="seller-form-grid">
                  <div className="form-group">
                    <label>{t("common.name")}</label>
                    <input
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("common.email")}</label>
                    <input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("common.password")}</label>
                    <input
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
                  {t("owner.createAdminBtn")}
                </button>
              </form>
            </div>

            <div className="card-panel">
              <h2>{t("owner.createAccountant")}</h2>
              <p className="seller-profile-sub">{t("owner.createAccountantHint")}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createStaff("accountant", accountantForm);
                }}
              >
                <div className="seller-form-grid">
                  <div className="form-group">
                    <label>{t("common.name")}</label>
                    <input
                      value={accountantForm.name}
                      onChange={(e) =>
                        setAccountantForm({ ...accountantForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("common.email")}</label>
                    <input
                      type="email"
                      value={accountantForm.email}
                      onChange={(e) =>
                        setAccountantForm({ ...accountantForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("common.password")}</label>
                    <input
                      value={accountantForm.password}
                      onChange={(e) =>
                        setAccountantForm({ ...accountantForm, password: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
                  {t("owner.createAccountantBtn")}
                </button>
              </form>
            </div>

            <div className="card-panel">
              <h2>{t("owner.createShippingManager")}</h2>
              <p className="seller-profile-sub">{t("owner.createShippingManagerHint")}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createStaff("shipping_manager", shippingManagerForm);
                }}
              >
                <div className="seller-form-grid">
                  <div className="form-group">
                    <label>{t("common.name")}</label>
                    <input
                      value={shippingManagerForm.name}
                      onChange={(e) =>
                        setShippingManagerForm({ ...shippingManagerForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("common.email")}</label>
                    <input
                      type="email"
                      value={shippingManagerForm.email}
                      onChange={(e) =>
                        setShippingManagerForm({ ...shippingManagerForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("shipping.phone")}</label>
                    <input
                      type="tel"
                      value={shippingManagerForm.phone}
                      onChange={(e) =>
                        setShippingManagerForm({ ...shippingManagerForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("common.password")}</label>
                    <input
                      value={shippingManagerForm.password}
                      onChange={(e) =>
                        setShippingManagerForm({ ...shippingManagerForm, password: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
                  {t("owner.createShippingManagerBtn")}
                </button>
              </form>
            </div>
          </div>

          <div className="card-panel">
            <h2>
              {t("owner.staffList")} ({staff.length})
            </h2>
            {staff.length === 0 ? (
              <p style={{ color: "var(--grey-400)" }}>{t("owner.noStaff")}</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("common.name")}</th>
                    <th>{t("common.email")}</th>
                    <th>{t("common.role")}</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge badge-role">{roleLabel(locale, u.role)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dashboard-grid">
            <div className="stat-card">
              <h3>{t("owner.totalProducts")}</h3>
              <div className="stat-value">{products.length}</div>
            </div>
            <div className="stat-card">
              <h3>{t("owner.registeredUsers")}</h3>
              <div className="stat-value">{users.length}</div>
            </div>
            <div className="stat-card">
              <h3>{t("owner.activeSellers")}</h3>
              <div className="stat-value">{sellers.length}</div>
            </div>
            <div className="stat-card">
              <h3>{t("owner.categories")}</h3>
              <div className="stat-value">{ALL_CATEGORIES.length}</div>
            </div>
          </div>

          <div className="card-panel">
            <h2>{t("owner.userManagement")}</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("common.name")}</th>
                  <th>{t("common.email")}</th>
                  <th>{t("common.role")}</th>
                  <th>{t("common.store")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge badge-role">{roleLabel(locale, u.role)}</span>
                    </td>
                    <td>{u.storeName ?? t("common.dash")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-panel">
            <h2>{t("owner.productsByCategory")}</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("common.category")}</th>
                  <th>{t("owner.productCount")}</th>
                </tr>
              </thead>
              <tbody>
                {categoryCounts.map(({ cat, count }) => (
                  <tr key={cat}>
                    <td>{category(cat)}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-panel">
            <h2>
              {t("owner.sellerListings")} ({sellerProducts.length})
            </h2>
            {sellerProducts.length === 0 ? (
              <p style={{ color: "var(--grey-400)" }}>{t("owner.noSellerProducts")}</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("seller.productName")}</th>
                    <th>{t("common.category")}</th>
                    <th>{t("common.price")}</th>
                    <th>{t("common.seller")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{category(p.category)}</td>
                      <td>{formatPrice(p.price, locale)}</td>
                      <td>{p.sellerName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card-panel">
            <h2>{t("owner.platformSummary")}</h2>
            <p style={{ fontSize: 14, color: "var(--grey-600)", lineHeight: 1.8 }}>
              {t("owner.summaryText", {
                products: products.length,
                categories: ALL_CATEGORIES.length,
                customers: customers.length,
                sellers: sellers.length,
              })}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
