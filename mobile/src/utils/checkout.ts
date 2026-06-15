export type ShippingMethod = "standard" | "express";

export function getShippingCost(
  subtotal: number,
  method: ShippingMethod
): number {
  if (method === "express") return 15;
  return subtotal >= 150 ? 0 : 8;
}

export function getEstimatedTax(subtotal: number): number {
  return Math.round(subtotal * 0.08 * 100) / 100;
}

export function generateOrderNumber(): string {
  const n = Date.now().toString(36).toUpperCase();
  return `PULSE-${n.slice(-8)}`;
}
