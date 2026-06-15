import type { MarketNamePreset, SellerProfile } from "../types";

const PROFILES_KEY = "door2door_seller_profiles";

function loadAll(): Record<string, SellerProfile> {
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    return stored ? (JSON.parse(stored) as Record<string, SellerProfile>) : {};
  } catch {
    return {};
  }
}

function saveAll(profiles: Record<string, SellerProfile>) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function loadSellerProfile(sellerId: string): SellerProfile | null {
  return loadAll()[sellerId] ?? null;
}

export function saveSellerProfile(sellerId: string, profile: SellerProfile) {
  const all = loadAll();
  all[sellerId] = profile;
  saveAll(all);
}

export function emptySellerProfile(): SellerProfile {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    marketPreset: "dordoi",
    marketCustom: "",
    storeAddress: "",
    returnAddress: "",
  };
}

export function profileFromUser(name: string, email?: string): SellerProfile {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
  return {
    ...emptySellerProfile(),
    firstName,
    lastName,
    email: email ?? "",
  };
}

const MARKET_LABELS: Record<MarketNamePreset, string> = {
  dordoi: "Dordoi",
  madina: "Madina",
  "orto-sai": "Orto Sai",
  custom: "",
};

export function getMarketDisplayName(profile: SellerProfile): string {
  if (profile.marketPreset === "custom") {
    return profile.marketCustom?.trim() || "";
  }
  return MARKET_LABELS[profile.marketPreset];
}

export function getSellerFullName(profile: SellerProfile): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
}
