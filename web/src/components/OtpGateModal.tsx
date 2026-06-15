import { FormEvent, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { verifyOwnerOtp } from "../utils/ownerOtp";

interface Props {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function OtpGateModal({ open, onClose, onVerified }: Props) {
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (verifyOwnerOtp(code)) {
      setCode("");
      onVerified();
      onClose();
    } else {
      setError(t("admin.otp.invalid"));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>{t("admin.otp.title")}</h2>
        <p className="modal-sub">{t("admin.otp.subtitle")}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp-code">{t("admin.otp.codeLabel")}</label>
            <input
              id="otp-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              autoFocus
              required
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t("common.back")}
            </button>
            <button type="submit" className="btn btn-primary">
              {t("admin.otp.verify")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
