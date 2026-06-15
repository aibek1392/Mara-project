import type { Locale } from "../i18n/types";
import { CURRENCY_LABEL, LOCALE_BCP47 } from "../i18n/types";
import type { UserRole } from "../types";

export function formatPrice(amount: number, locale: Locale = "ky"): string {
  const formatted = new Intl.NumberFormat(LOCALE_BCP47[locale], {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${CURRENCY_LABEL[locale]}`;
}

export function pluralResults(n: number, locale: Locale): string {
  if (locale === "en") return n === 1 ? "result" : "results";
  if (locale === "ky") return "натыйжа";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "результат";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "результата";
  return "результатов";
}

export function pluralItems(n: number, locale: Locale): string {
  if (locale === "en") return n === 1 ? "item" : "items";
  if (locale === "ky") return "товар";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "товара";
  return "товаров";
}

export function roleLabel(locale: Locale, role: UserRole): string {
  const labels: Record<Locale, Record<UserRole, string>> = {
    ru: {
      owner: "Владелец",
      admin: "Администратор",
      accountant: "Бухгалтер",
      user: "Покупатель",
      seller: "Продавец",
      shipping_manager: "Менеджер доставки",
      delivery_driver: "Водитель",
    },
    en: {
      owner: "Owner",
      admin: "Admin",
      accountant: "Accountant",
      user: "Customer",
      seller: "Seller",
      shipping_manager: "Shipping Manager",
      delivery_driver: "Delivery Driver",
    },
    ky: {
      owner: "Ээси",
      admin: "Администратор",
      accountant: "Бухгалтер",
      user: "Кардар",
      seller: "Сатуучу",
      shipping_manager: "Жеткирүү менеджери",
      delivery_driver: "Айдоочу",
    },
  };
  return labels[locale][role];
}
