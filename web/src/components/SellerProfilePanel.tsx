import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import type { MarketNamePreset, SellerProfile } from "../types";
import {
  emptySellerProfile,
  getMarketDisplayName,
  getSellerFullName,
  loadSellerProfile,
  profileFromUser,
  saveSellerProfile,
} from "../utils/sellerProfile";
import { saveUsers, loadUsers } from "../data/users";
import { CollapsiblePanel } from "./CollapsiblePanel";

const MARKET_PRESETS: MarketNamePreset[] = ["dordoi", "madina", "orto-sai", "custom"];

function isProfileComplete(profile: SellerProfile): boolean {
  if (!profile.firstName.trim() || !profile.lastName.trim()) return false;
  if (!profile.phone.trim()) return false;
  if (!profile.storeAddress.trim()) return false;
  if (!profile.returnAddress.trim()) return false;
  if (profile.marketPreset === "custom" && !profile.marketCustom?.trim()) return false;
  return true;
}

export function SellerProfilePanel() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<SellerProfile>(emptySellerProfile());
  const [savedSnapshot, setSavedSnapshot] = useState<SellerProfile>(emptySellerProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const stored = loadSellerProfile(user.id);
    const initial = stored ?? profileFromUser(user.name, user.email);
    setProfile(initial);
    setSavedSnapshot(initial);
    setIsEditing(!isProfileComplete(initial));
  }, [user]);

  const update = (patch: Partial<SellerProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
    setSaved(false);
    setError("");
  };

  const panelSubtitle = useMemo(() => {
    if (!isProfileComplete(savedSnapshot)) {
      return t("seller.profile.incompleteHint");
    }
    const name = getSellerFullName(savedSnapshot);
    const market = getMarketDisplayName(savedSnapshot);
    if (name && market) return `${name} · ${market}`;
    return name || market || t("seller.profile.subtitle");
  }, [savedSnapshot, t]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setError(t("seller.profile.errors.name"));
      return;
    }
    if (!profile.phone.trim()) {
      setError(t("seller.profile.errors.phone"));
      return;
    }
    if (!profile.storeAddress.trim()) {
      setError(t("seller.profile.errors.storeAddress"));
      return;
    }
    if (!profile.returnAddress.trim()) {
      setError(t("seller.profile.errors.returnAddress"));
      return;
    }
    if (profile.marketPreset === "custom" && !profile.marketCustom?.trim()) {
      setError(t("seller.profile.errors.marketCustom"));
      return;
    }

    saveSellerProfile(user.id, profile);

    const marketName = getMarketDisplayName(profile);
    const fullName = getSellerFullName(profile);
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        name: fullName || users[idx].name,
        storeName: marketName || users[idx].storeName,
      };
      saveUsers(users);
    }

    setSavedSnapshot(profile);
    setIsEditing(false);
    setSaved(true);
    setError("");
    setTimeout(() => setSaved(false), 3000);
  };

  const startEdit = () => {
    setProfile(savedSnapshot);
    setIsEditing(true);
    setError("");
    setSaved(false);
  };

  const cancelEdit = () => {
    setProfile(savedSnapshot);
    setIsEditing(false);
    setError("");
    setSaved(false);
  };

  const marketLabel = (preset: MarketNamePreset) => {
    if (preset === "custom") return t("seller.profile.marketDifferent");
    return t(`seller.profile.markets.${preset}`);
  };

  const displayMarket =
    savedSnapshot.marketPreset === "custom"
      ? savedSnapshot.marketCustom?.trim() || t("seller.profile.marketDifferent")
      : marketLabel(savedSnapshot.marketPreset);

  return (
    <section className="seller-section seller-profile-section">
      <CollapsiblePanel
        title={t("seller.profile.title")}
        subtitle={panelSubtitle}
        defaultOpen={!isProfileComplete(savedSnapshot)}
        variant="section"
        className="seller-profile-collapsible"
      >
        <p className="seller-profile-sub">{t("seller.profile.subtitle")}</p>

        {saved && <div className="alert alert-success">{t("seller.profile.saved")}</div>}
        {error && <p className="field-error">{error}</p>}

        {!isEditing ? (
          <div className="seller-profile-view">
            {isProfileComplete(savedSnapshot) ? (
              <dl className="seller-profile-summary">
                <div className="seller-profile-summary-row">
                  <dt>{t("seller.profile.firstName")}</dt>
                  <dd>{savedSnapshot.firstName}</dd>
                </div>
                <div className="seller-profile-summary-row">
                  <dt>{t("seller.profile.lastName")}</dt>
                  <dd>{savedSnapshot.lastName}</dd>
                </div>
                <div className="seller-profile-summary-row">
                  <dt>{t("seller.profile.phone")}</dt>
                  <dd>{savedSnapshot.phone}</dd>
                </div>
                {savedSnapshot.email?.trim() && (
                  <div className="seller-profile-summary-row">
                    <dt>{t("seller.profile.email")}</dt>
                    <dd>{savedSnapshot.email}</dd>
                  </div>
                )}
                <div className="seller-profile-summary-row">
                  <dt>{t("seller.profile.marketName")}</dt>
                  <dd>{displayMarket}</dd>
                </div>
                <div className="seller-profile-summary-row">
                  <dt>{t("seller.profile.storeAddress")}</dt>
                  <dd>{savedSnapshot.storeAddress}</dd>
                </div>
                <div className="seller-profile-summary-row">
                  <dt>{t("seller.profile.returnAddress")}</dt>
                  <dd>{savedSnapshot.returnAddress}</dd>
                </div>
              </dl>
            ) : (
              <p className="seller-profile-empty">{t("seller.profile.emptyState")}</p>
            )}

            <button type="button" className="btn btn-primary btn-sm" onClick={startEdit}>
              {isProfileComplete(savedSnapshot) ? t("common.edit") : t("seller.profile.addProfile")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="seller-profile-form">
            <div className="seller-form-grid">
              <div className="form-group">
                <label htmlFor="seller-firstName">{t("seller.profile.firstName")}</label>
                <input
                  id="seller-firstName"
                  value={profile.firstName}
                  onChange={(e) => update({ firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="seller-lastName">{t("seller.profile.lastName")}</label>
                <input
                  id="seller-lastName"
                  value={profile.lastName}
                  onChange={(e) => update({ lastName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="seller-phone">{t("seller.profile.phone")}</label>
                <input
                  id="seller-phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  placeholder="+996 …"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="seller-email">
                  {t("seller.profile.email")}{" "}
                  <span className="field-optional">({t("seller.profile.optional")})</span>
                </label>
                <input
                  id="seller-email"
                  type="email"
                  value={profile.email ?? ""}
                  onChange={(e) => update({ email: e.target.value })}
                />
              </div>
            </div>

            <fieldset className="seller-fieldset seller-market-fieldset">
              <legend>{t("seller.profile.marketName")}</legend>
              <div className="seller-market-options">
                {MARKET_PRESETS.map((preset) => (
                  <label
                    key={preset}
                    className={`seller-market-option ${profile.marketPreset === preset ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="marketPreset"
                      checked={profile.marketPreset === preset}
                      onChange={() => update({ marketPreset: preset })}
                    />
                    <span>{marketLabel(preset)}</span>
                  </label>
                ))}
              </div>
              {profile.marketPreset === "custom" && (
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label htmlFor="seller-marketCustom">{t("seller.profile.marketCustomLabel")}</label>
                  <input
                    id="seller-marketCustom"
                    value={profile.marketCustom ?? ""}
                    onChange={(e) => update({ marketCustom: e.target.value })}
                    placeholder={t("seller.profile.marketCustomPlaceholder")}
                  />
                </div>
              )}
            </fieldset>

            <div className="seller-form-grid">
              <div className="form-group form-full">
                <label htmlFor="seller-storeAddress">{t("seller.profile.storeAddress")}</label>
                <textarea
                  id="seller-storeAddress"
                  rows={2}
                  value={profile.storeAddress}
                  onChange={(e) => update({ storeAddress: e.target.value })}
                  placeholder={t("seller.profile.storeAddressHint")}
                  required
                />
              </div>
              <div className="form-group form-full">
                <label htmlFor="seller-returnAddress">{t("seller.profile.returnAddress")}</label>
                <textarea
                  id="seller-returnAddress"
                  rows={2}
                  value={profile.returnAddress}
                  onChange={(e) => update({ returnAddress: e.target.value })}
                  placeholder={t("seller.profile.returnAddressHint")}
                  required
                />
              </div>
            </div>

            <div className="seller-profile-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                {t("seller.profile.save")}
              </button>
              {isProfileComplete(savedSnapshot) && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                  {t("seller.cancelEdit")}
                </button>
              )}
            </div>
          </form>
        )}
      </CollapsiblePanel>
    </section>
  );
}
