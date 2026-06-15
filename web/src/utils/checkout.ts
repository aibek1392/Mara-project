export type ShippingMethod = "standard" | "express";
export type DeliveryZone = "kyrgyzstan" | "almaty";

export const DELIVERY_ZONES: DeliveryZone[] = ["kyrgyzstan", "almaty"];

const SHIPPING_RATES: Record<
  DeliveryZone,
  { express: number; standard: number; freeThreshold: number }
> = {
  kyrgyzstan: { express: 1500, standard: 800, freeThreshold: 15000 },
  almaty: { express: 2500, standard: 1500, freeThreshold: 20000 },
};

export function getShippingCost(
  subtotal: number,
  method: ShippingMethod,
  zone: DeliveryZone = "kyrgyzstan"
): number {
  const rates = SHIPPING_RATES[zone];
  if (method === "express") return rates.express;
  return subtotal >= rates.freeThreshold ? 0 : rates.standard;
}

export function getEstimatedDeliveryKey(
  zone: DeliveryZone,
  method: ShippingMethod
): string {
  return `checkout.estimated.${zone}.${method}`;
}

export function getEstimatedTax(subtotal: number): number {
  return Math.round(subtotal * 0.08 * 100) / 100;
}

export function generateOrderNumber(): string {
  const n = Date.now().toString(36).toUpperCase();
  return `D2D-${n.slice(-8)}`;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  deliveryZone: DeliveryZone;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  shippingMethod: ShippingMethod;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

export const emptyCheckoutForm = (): CheckoutFormData => ({
  email: "",
  firstName: "",
  lastName: "",
  deliveryZone: "kyrgyzstan",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  shippingMethod: "standard",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardName: "",
});
