import type { PhoneOtpRecord } from "../types";
import { normalizePhone } from "./phone";

const PHONE_OTP_KEY = "door2door_phone_otp";
const OTP_TTL_MS = 10 * 60 * 1000;

function loadOtp(): PhoneOtpRecord | null {
  try {
    const stored = localStorage.getItem(PHONE_OTP_KEY);
    if (!stored) return null;
    const record = JSON.parse(stored) as PhoneOtpRecord;
    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(PHONE_OTP_KEY);
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

export function sendPhoneOtp(
  phone: string,
  purpose: PhoneOtpRecord["purpose"],
  role?: PhoneOtpRecord["role"]
): PhoneOtpRecord {
  const normalized = normalizePhone(phone);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const record: PhoneOtpRecord = {
    phone: normalized,
    code,
    purpose,
    role,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + OTP_TTL_MS,
  };
  localStorage.setItem(PHONE_OTP_KEY, JSON.stringify(record));
  return record;
}

export function getActivePhoneOtp(): PhoneOtpRecord | null {
  return loadOtp();
}

export function verifyPhoneOtp(phone: string, input: string): PhoneOtpRecord | null {
  const record = loadOtp();
  if (!record) return null;
  if (record.code !== input.trim()) return null;
  if (normalizePhone(phone) !== record.phone) return null;
  localStorage.removeItem(PHONE_OTP_KEY);
  return record;
}
