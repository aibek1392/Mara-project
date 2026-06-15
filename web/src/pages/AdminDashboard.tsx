import { FormEvent, useEffect, useState } from "react";
import { OtpGateModal } from "../components/OtpGateModal";
import { useProducts } from "../context/ProductContext";
import { useLanguage } from "../context/LanguageContext";
import { createUser, getUsersByRole, loadUsers, updateUser } from "../data/users";
import type { SellerProfile, User } from "../types";
import { formatPrice } from "../utils/format";
import {
  getAdminOtpSessionRemaining,
  isAdminOtpVerified,
} from "../utils/ownerOtp";
import {
  getMarketDisplayName,
  getSellerFullName,
  loadSellerProfile,
  profileFromUser,
  saveSellerProfile,
} from "../utils/sellerProfile";

const emptyNewSeller = () => ({
  email: "",
  password: "123456",
  firstName: "",
  lastName: "",
  phone: "",
  storeName: "",
});

export function AdminDashboard() {
  const { products } = useProducts();
  const { t, category, locale } = useLanguage();
  const [sellers, setSellers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(isAdminOtpVerified());
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newSeller, setNewSeller] = useState(emptyNewSeller());
  const [editProfile, setEditProfile] = useState<SellerProfile | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(getAdminOtpSessionRemaining());

  const refresh = () => setSellers(getUsersByRole("seller"));

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const ok = isAdminOtpVerified();
      setOtpVerified(ok);
      setRemaining(getAdminOtpSessionRemaining());
      if (!ok) setEditMode(false);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setEditProfile(null);
      return;
    }
    const user = sellers.find((s) => s.id === selectedId);
    if (!user) return;
    const stored = loadSellerProfile(selectedId);
    setEditProfile(stored ?? profileFromUser(user.name, user.email));
  }, [selectedId, sellers]);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const requireOtp = (action: () => void) => {
    if (otpVerified) {
      action();
    } else {
      setOtpModalOpen(true);
    }
  };

  const handleAddSeller = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newSeller.email || !newSeller.firstName || !newSeller.lastName) {
      setError(t("admin.errors.required"));
      return;
    }
    try {
      const name = `${newSeller.firstName} ${newSeller.lastName}`.trim();
      const user = createUser({
        email: newSeller.email,
        password: newSeller.password || "123456",
        name,
        role: "seller",
        storeName: newSeller.storeName || name,
      });
      saveSellerProfile(user.id, {
        ...profileFromUser(name, newSeller.email),
        firstName: newSeller.firstName,
        lastName: newSeller.lastName,
        phone: newSeller.phone,
      });
      setNewSeller(emptyNewSeller());
      refresh();
      showMsg(t("admin.sellerAdded"));
    } catch {
      setError(t("admin.errors.emailExists"));
    }
  };

  const handleSaveSeller = () => {
    if (!selectedId || !editProfile) return;
    requireOtp(() => {
      saveSellerProfile(selectedId, editProfile);
      const market = getMarketDisplayName(editProfile);
      updateUser(selectedId, {
        name: getSellerFullName(editProfile),
        storeName: market || undefined,
        email: editProfile.email || loadUsers().find((u) => u.id === selectedId)?.email,
      });
      refresh();
      setEditMode(false);
      showMsg(t("admin.sellerUpdated"));
    });
  };

  const selected = sellers.find((s) => s.id === selectedId);
  const sellerProducts = selectedId
    ? products.filter((p) => p.sellerId === selectedId)
    : [];

  const formatRemaining = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">{t("admin.title")}</h1>
          <p style={{ color: "var(--grey-400)", marginTop: 4 }}>{t("admin.subtitle")}</p>
        </div>
        <span className="badge badge-role">{t("roleAccess.admin")}</span>
      </div>

      <div className={`alert ${otpVerified ? "alert-success" : "alert-warning"}`}>
        {otpVerified
          ? t("admin.otp.active", { time: formatRemaining(remaining) })
          : t("admin.otp.required")}
        {!otpVerified && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginLeft: 12 }}
            onClick={() => setOtpModalOpen(true)}
          >
            {t("admin.otp.enterCode")}
          </button>
        )}
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card-panel">
        <h2>{t("admin.addSeller")}</h2>
        <p className="seller-profile-sub">{t("admin.addSellerHint")}</p>
        <form onSubmit={handleAddSeller}>
          <div className="seller-form-grid">
            <div className="form-group">
              <label>{t("seller.profile.firstName")}</label>
              <input value={newSeller.firstName} onChange={(e) => setNewSeller({ ...newSeller, firstName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{t("seller.profile.lastName")}</label>
              <input value={newSeller.lastName} onChange={(e) => setNewSeller({ ...newSeller, lastName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{t("common.email")}</label>
              <input type="email" value={newSeller.email} onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{t("seller.profile.phone")}</label>
              <input value={newSeller.phone} onChange={(e) => setNewSeller({ ...newSeller, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{t("common.password")}</label>
              <input value={newSeller.password} onChange={(e) => setNewSeller({ ...newSeller, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{t("admin.storeNameOptional")}</label>
              <input value={newSeller.storeName} onChange={(e) => setNewSeller({ ...newSeller, storeName: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
            {t("admin.createSeller")}
          </button>
        </form>
      </div>

      <div className="admin-layout">
        <div className="card-panel">
          <h2>{t("admin.sellersList")} ({sellers.length})</h2>
          {sellers.length === 0 ? (
            <p style={{ color: "var(--grey-400)" }}>{t("admin.noSellers")}</p>
          ) : (
            <ul className="admin-seller-list">
              {sellers.map((s) => {
                const profile = loadSellerProfile(s.id);
                const market = profile ? getMarketDisplayName(profile) : s.storeName;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`admin-seller-item ${selectedId === s.id ? "active" : ""}`}
                      onClick={() => { setSelectedId(s.id); setEditMode(false); }}
                    >
                      <strong>{profile ? getSellerFullName(profile) : s.name}</strong>
                      <span>{market ?? s.email}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card-panel">
          {!selected || !editProfile ? (
            <p style={{ color: "var(--grey-400)" }}>{t("admin.selectSeller")}</p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2>{t("admin.sellerReview")}</h2>
                {!editMode ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => requireOtp(() => setEditMode(true))}
                  >
                    {t("admin.editSeller")}
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>
                      {t("common.back")}
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveSeller}>
                      {t("admin.saveChanges")}
                    </button>
                  </div>
                )}
              </div>

              <div className="seller-form-grid">
                <div className="form-group">
                  <label>{t("seller.profile.firstName")}</label>
                  <input
                    value={editProfile.firstName}
                    disabled={!editMode}
                    onChange={(e) => setEditProfile({ ...editProfile, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t("seller.profile.lastName")}</label>
                  <input
                    value={editProfile.lastName}
                    disabled={!editMode}
                    onChange={(e) => setEditProfile({ ...editProfile, lastName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t("seller.profile.phone")}</label>
                  <input
                    value={editProfile.phone}
                    disabled={!editMode}
                    onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t("common.email")}</label>
                  <input
                    value={editProfile.email ?? selected.email}
                    disabled={!editMode}
                    onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                  />
                </div>
                <div className="form-group form-full">
                  <label>{t("seller.profile.storeAddress")}</label>
                  <textarea
                    rows={2}
                    value={editProfile.storeAddress}
                    disabled={!editMode}
                    onChange={(e) => setEditProfile({ ...editProfile, storeAddress: e.target.value })}
                  />
                </div>
                <div className="form-group form-full">
                  <label>{t("seller.profile.returnAddress")}</label>
                  <textarea
                    rows={2}
                    value={editProfile.returnAddress}
                    disabled={!editMode}
                    onChange={(e) => setEditProfile({ ...editProfile, returnAddress: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: 24, marginBottom: 12 }}>{t("admin.products")} ({sellerProducts.length})</h3>
              {sellerProducts.length === 0 ? (
                <p style={{ color: "var(--grey-400)" }}>{t("admin.noProducts")}</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("seller.productName")}</th>
                      <th>{t("common.category")}</th>
                      <th>{t("common.price")}</th>
                      <th>{t("seller.quantity")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{category(p.category)}</td>
                        <td>{formatPrice(p.price, locale)}</td>
                        <td>{p.stock ?? t("common.dash")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>

      <OtpGateModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerified={() => {
          setOtpVerified(true);
          setEditMode(true);
        }}
      />
    </div>
  );
}
