import type { DeliveryZone, ShippingMethod } from "./checkout";
import type { Order, ShippingAddress } from "../types";

export function buildShippingAddress(form: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryZone: DeliveryZone;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
}): ShippingAddress {
  return {
    recipientName: `${form.firstName} ${form.lastName}`.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    deliveryZone: form.deliveryZone,
    address: form.address.trim(),
    apartment: form.apartment.trim() || undefined,
    city: form.city.trim(),
    state: form.state.trim(),
    zip: form.zip.trim(),
  };
}

/** Sort key: zone → city → address → recipient name → order id */
export function routeSortKey(order: Order): string {
  const a = order.shippingAddress;
  if (!a) return order.id;
  const city = a.deliveryZone === "almaty" ? "Almaty" : a.city || "";
  const parts = [
    a.deliveryZone,
    city.toLowerCase(),
    a.address.toLowerCase(),
    a.recipientName.toLowerCase(),
    order.id,
  ];
  return parts.join("|");
}

export function sortOrdersForRouting(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => routeSortKey(a).localeCompare(routeSortKey(b)));
}

export function formatAddress(order: Order): string {
  const a = order.shippingAddress;
  if (!a) return order.userName;
  const line2 = a.apartment ? `, ${a.apartment}` : "";
  const cityLine =
    a.deliveryZone === "almaty"
      ? "Almaty, Kazakhstan"
      : [a.city, a.state, a.zip].filter(Boolean).join(", ");
  return `${a.address}${line2} · ${cityLine}`;
}

export interface DriverDeliveryDetails {
  recipientName: string;
  phone: string;
  streetLine: string;
  cityLine: string;
  zoneLabel: string;
}

export function getDriverDeliveryDetails(order: Order): DriverDeliveryDetails {
  const a = order.shippingAddress;
  if (!a) {
    return {
      recipientName: order.userName,
      phone: "—",
      streetLine: "—",
      cityLine: "—",
      zoneLabel: "—",
    };
  }
  const streetLine = [a.address, a.apartment].filter(Boolean).join(", ");
  const cityLine =
    a.deliveryZone === "almaty"
      ? "Almaty, Kazakhstan"
      : [a.city, a.state, a.zip].filter(Boolean).join(", ");
  const zoneLabel =
    a.deliveryZone === "almaty" ? "Almaty, Kazakhstan" : "Kyrgyzstan";
  return {
    recipientName: a.recipientName || order.userName,
    phone: a.phone || "—",
    streetLine: streetLine || "—",
    cityLine: cityLine || "—",
    zoneLabel,
  };
}

export function allSellerItemsDropped(order: Order): boolean {
  return order.items.every((i) => i.postalDroppedOff);
}

export function shippingMethodLabel(method: ShippingMethod): string {
  return method === "express" ? "Express" : "Standard";
}
