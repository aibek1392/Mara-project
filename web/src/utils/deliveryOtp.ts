export function generateDeliveryOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function normalizeRecipientName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function recipientNamesMatch(expected: string, entered: string): boolean {
  if (!entered.trim()) return false;
  return normalizeRecipientName(expected) === normalizeRecipientName(entered);
}

export type ConfirmDeliveryResult =
  | "ok"
  | "not_found"
  | "wrong_driver"
  | "wrong_status"
  | "no_otp"
  | "wrong_name"
  | "wrong_code";

export function getExpectedRecipientName(order: {
  shippingAddress?: { recipientName: string };
  userName: string;
}): string {
  return order.shippingAddress?.recipientName?.trim() || order.userName;
}
