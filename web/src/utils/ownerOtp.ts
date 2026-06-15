import type { OtpRecord } from "../types";

const OTP_KEY = "door2door_owner_otp";
const ADMIN_OTP_SESSION_KEY = "door2door_admin_otp_session";
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const ADMIN_SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes after verify

function loadOtp(): OtpRecord | null {
  try {
    const stored = localStorage.getItem(OTP_KEY);
    if (!stored) return null;
    const record = JSON.parse(stored) as OtpRecord;
    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(OTP_KEY);
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

export function generateOwnerOtp(ownerPhone: string): OtpRecord {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const record: OtpRecord = {
    code,
    phone: ownerPhone,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + OTP_TTL_MS,
  };
  localStorage.setItem(OTP_KEY, JSON.stringify(record));
  return record;
}

export function getActiveOwnerOtp(): OtpRecord | null {
  return loadOtp();
}

export function verifyOwnerOtp(input: string): boolean {
  const record = loadOtp();
  if (!record || record.code !== input.trim()) return false;
  localStorage.setItem(
    ADMIN_OTP_SESSION_KEY,
    JSON.stringify({ verifiedAt: Date.now(), expiresAt: Date.now() + ADMIN_SESSION_TTL_MS })
  );
  localStorage.removeItem(OTP_KEY);
  return true;
}

export function isAdminOtpVerified(): boolean {
  try {
    const stored = localStorage.getItem(ADMIN_OTP_SESSION_KEY);
    if (!stored) return false;
    const session = JSON.parse(stored) as { expiresAt: number };
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(ADMIN_OTP_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function clearAdminOtpSession() {
  localStorage.removeItem(ADMIN_OTP_SESSION_KEY);
}

export function getAdminOtpSessionRemaining(): number {
  try {
    const stored = localStorage.getItem(ADMIN_OTP_SESSION_KEY);
    if (!stored) return 0;
    const session = JSON.parse(stored) as { expiresAt: number };
    return Math.max(0, session.expiresAt - Date.now());
  } catch {
    return 0;
  }
}
