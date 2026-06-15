import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { findUserByPhone } from "../data/users";
import { normalizePhone } from "../utils/phone";
import { sendPhoneOtp, verifyPhoneOtp } from "../utils/phoneOtp";

const demoAccounts = [
  { roleKey: "login.demoOwner", email: "owner@door2door.com", password: "123456" },
  { roleKey: "login.demoCustomer", email: "user@door2door.com", password: "123456", phone: "+996700111111" },
  { roleKey: "login.demoSeller", email: "seller@door2door.com", password: "123456", phone: "+996700222222" },
  { roleKey: "login.demoShipping", email: "shipping@door2door.com", password: "123456" },
  { roleKey: "login.demoDriver", email: "driver@door2door.com", password: "123456" },
];

type AuthMode = "login" | "register";
type LoginMethod = "email" | "phone";
type OtpStep = "phone" | "otp" | "details";

function roleDestination(role: string) {
  if (role === "owner") return "/owner";
  if (role === "admin") return "/admin";
  if (role === "accountant") return "/accountant";
  if (role === "seller") return "/seller";
  if (role === "shipping_manager") return "/owner?tab=shipping";
  if (role === "delivery_driver") return "/driver";
  return "/account";
}

export function LoginPage() {
  const { login, loginWithPhone, registerWithPhone, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [registerRole, setRegisterRole] = useState<"user" | "seller">("user");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [optionalEmail, setOptionalEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate(roleDestination(user.role), { replace: true });
  }, [user, navigate]);

  const resetOtpFlow = () => {
    setOtpStep("phone");
    setOtpCode("");
    setDemoOtp("");
    setError("");
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    resetOtpFlow();
    setError("");
  };

  const fillDemo = (demoEmail: string, demoPassword: string, demoPhone?: string) => {
    setLoginMethod("email");
    setEmail(demoEmail);
    setPassword(demoPassword);
    if (demoPhone) setPhone(demoPhone);
    setError("");
  };

  const handleEmailLogin = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!login(email, password)) setError(t("login.error"));
  };

  const handleSendLoginOtp = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError(t("register.errors.phoneRequired"));
      return;
    }
    const existing = findUserByPhone(normalized);
    if (!existing) {
      setError(t("register.errors.phoneNotFound"));
      return;
    }
    if (existing.role !== "user" && existing.role !== "seller") {
      setError(t("register.errors.phoneStaffOnly"));
      return;
    }
    const record = sendPhoneOtp(normalized, "login");
    setDemoOtp(record.code);
    setOtpStep("otp");
  };

  const handleVerifyLoginOtp = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const record = verifyPhoneOtp(phone, otpCode);
    if (!record) {
      setError(t("register.errors.invalidOtp"));
      return;
    }
    if (!loginWithPhone(phone)) setError(t("register.errors.phoneNotFound"));
  };

  const handleSendRegisterOtp = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError(t("register.errors.phoneRequired"));
      return;
    }
    if (findUserByPhone(normalized)) {
      setError(t("register.errors.phoneExists"));
      return;
    }
    const record = sendPhoneOtp(normalized, "register", registerRole);
    setDemoOtp(record.code);
    setOtpStep("otp");
  };

  const handleVerifyRegisterOtp = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const record = verifyPhoneOtp(phone, otpCode);
    if (!record || record.purpose !== "register") {
      setError(t("register.errors.invalidOtp"));
      return;
    }
    setOtpStep("details");
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError(t("register.errors.nameRequired"));
      return;
    }
    try {
      registerWithPhone({
        phone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: registerRole,
        email: optionalEmail.trim() || undefined,
        storeName: registerRole === "seller" ? storeName.trim() || undefined : undefined,
      });
    } catch {
      setError(t("register.errors.phoneExists"));
    }
  };

  return (
    <div className="login-page">
      <div className="login-box" style={{ maxWidth: 440 }}>
        <h1>{mode === "login" ? t("login.title") : t("register.title")}</h1>
        <p className="subtitle">
          {mode === "login" ? t("login.subtitle") : t("register.subtitle")}
        </p>

        <div className="auth-tabs" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            className={`btn ${mode === "login" ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1 }}
            onClick={() => switchMode("login")}
          >
            {t("login.tabSignIn")}
          </button>
          <button
            type="button"
            className={`btn ${mode === "register" ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1 }}
            onClick={() => switchMode("register")}
          >
            {t("register.tabRegister")}
          </button>
        </div>

        {mode === "login" && (
          <>
            <div className="login-demo">
              <h4>{t("login.demoTitle")}</h4>
              {demoAccounts.map((a) => (
                <p key={a.email}>
                  <strong>{t(a.roleKey)}:</strong>{" "}
                  <button
                    type="button"
                    onClick={() => fillDemo(a.email, a.password, a.phone)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--highlight)",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontSize: "inherit",
                    }}
                  >
                    {a.email}
                  </button>
                  {a.phone && (
                    <span style={{ color: "var(--grey-400)", fontSize: 12 }}>
                      {" "}
                      · {a.phone}
                    </span>
                  )}
                </p>
              ))}
            </div>

            <div className="auth-tabs" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                className={`btn btn-sm ${loginMethod === "email" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => {
                  setLoginMethod("email");
                  resetOtpFlow();
                }}
              >
                {t("login.methodEmail")}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${loginMethod === "phone" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => {
                  setLoginMethod("phone");
                  resetOtpFlow();
                }}
              >
                {t("login.methodPhone")}
              </button>
            </div>
          </>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {mode === "login" && loginMethod === "email" && (
          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="email">{t("common.email")}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">{t("common.password")}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t("login.passwordPlaceholder")}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
              {t("login.submit")}
            </button>
          </form>
        )}

        {mode === "login" && loginMethod === "phone" && otpStep === "phone" && (
          <form onSubmit={handleSendLoginOtp}>
            <div className="form-group">
              <label htmlFor="login-phone">{t("common.phone")}</label>
              <input
                id="login-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+996700123456"
              />
            </div>
            <p style={{ fontSize: 13, color: "var(--grey-400)", marginBottom: 12 }}>
              {t("register.phoneHint")}
            </p>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
              {t("register.sendOtp")}
            </button>
          </form>
        )}

        {mode === "login" && loginMethod === "phone" && otpStep === "otp" && (
          <form onSubmit={handleVerifyLoginOtp}>
            {demoOtp && (
              <div className="alert alert-success" style={{ marginBottom: 12 }}>
                <strong>{t("register.otpDemo", { phone: normalizePhone(phone) })}</strong>{" "}
                <code>{demoOtp}</code>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="login-otp">{t("register.otpLabel")}</label>
              <input
                id="login-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="123456"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginBottom: 8 }}>
              {t("register.verifyOtp")}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%" }}
              onClick={resetOtpFlow}
            >
              {t("register.changePhone")}
            </button>
          </form>
        )}

        {mode === "register" && (
          <>
            <div className="form-group">
              <label>{t("register.accountType")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className={`btn ${registerRole === "user" ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1 }}
                  onClick={() => setRegisterRole("user")}
                >
                  {t("register.roleCustomer")}
                </button>
                <button
                  type="button"
                  className={`btn ${registerRole === "seller" ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1 }}
                  onClick={() => setRegisterRole("seller")}
                >
                  {t("register.roleSeller")}
                </button>
              </div>
            </div>

            {otpStep === "phone" && (
              <form onSubmit={handleSendRegisterOtp}>
                <div className="form-group">
                  <label htmlFor="reg-phone">{t("common.phone")}</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+996700123456"
                  />
                </div>
                <p style={{ fontSize: 13, color: "var(--grey-400)", marginBottom: 12 }}>
                  {t("register.phoneHint")}
                </p>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
                  {t("register.sendOtp")}
                </button>
              </form>
            )}

            {otpStep === "otp" && (
              <form onSubmit={handleVerifyRegisterOtp}>
                {demoOtp && (
                  <div className="alert alert-success" style={{ marginBottom: 12 }}>
                    <strong>{t("register.otpDemo", { phone: normalizePhone(phone) })}</strong>{" "}
                    <code>{demoOtp}</code>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="reg-otp">{t("register.otpLabel")}</label>
                  <input
                    id="reg-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    required
                    placeholder="123456"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginBottom: 8 }}>
                  {t("register.verifyOtp")}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: "100%" }}
                  onClick={resetOtpFlow}
                >
                  {t("register.changePhone")}
                </button>
              </form>
            )}

            {otpStep === "details" && (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="firstName">{t("register.firstName")}</label>
                  <input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">{t("register.lastName")}</label>
                  <input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="optionalEmail">{t("register.optionalEmail")}</label>
                  <input
                    id="optionalEmail"
                    type="email"
                    value={optionalEmail}
                    onChange={(e) => setOptionalEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                {registerRole === "seller" && (
                  <div className="form-group">
                    <label htmlFor="storeName">{t("register.storeName")}</label>
                    <input
                      id="storeName"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder={t("register.storeNamePlaceholder")}
                    />
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
                  {t("register.submit")}
                </button>
              </form>
            )}
          </>
        )}

        <p style={{ marginTop: 16, fontSize: 13, color: "var(--grey-400)", textAlign: "center" }}>
          <Link to="/" style={{ color: "var(--highlight)" }}>
            {t("login.continueShopping")}
          </Link>
        </p>
      </div>
    </div>
  );
}
