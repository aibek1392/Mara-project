import type { OwnerSettings, SellerBilling } from "../types";

const SETTINGS_KEY = "door2door_owner_settings";
const BILLING_KEY = "door2door_seller_billing";

const DEFAULT_SETTINGS: OwnerSettings = {
  phone: "+996700123456",
};

export function loadOwnerSettings(): OwnerSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as OwnerSettings) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveOwnerSettings(settings: OwnerSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadAllBilling(): Record<string, SellerBilling> {
  try {
    const stored = localStorage.getItem(BILLING_KEY);
    return stored ? (JSON.parse(stored) as Record<string, SellerBilling>) : {};
  } catch {
    return {};
  }
}

function saveAllBilling(all: Record<string, SellerBilling>) {
  localStorage.setItem(BILLING_KEY, JSON.stringify(all));
}

export function emptySellerBilling(sellerId: string): SellerBilling {
  return {
    sellerId,
    yearlySubscriptionPaid: false,
    yearlySubscriptionAmount: 5000,
    yearlySubscriptionDate: "",
    photoshootItemCount: 0,
    itemQuantity: 0,
    photoshootScheduledAt: "",
    updatedAt: new Date().toISOString(),
  };
}

export function loadSellerBilling(sellerId: string): SellerBilling {
  return loadAllBilling()[sellerId] ?? emptySellerBilling(sellerId);
}

export function saveSellerBilling(billing: SellerBilling) {
  const all = loadAllBilling();
  all[billing.sellerId] = { ...billing, updatedAt: new Date().toISOString() };
  saveAllBilling(all);
}

export function loadAllSellerBilling(): SellerBilling[] {
  return Object.values(loadAllBilling());
}

export function getAllBillingMap(): Record<string, SellerBilling> {
  return loadAllBilling();
}
