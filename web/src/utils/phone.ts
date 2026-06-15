/** Normalize phone to digits with leading + for comparison. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";

  // Kyrgyz 9-digit local (700123456)
  if (digits.length === 9) {
    return `+996${digits}`;
  }
  // Local with leading 0 (0700123456)
  if (digits.length === 10 && digits.startsWith("0")) {
    return `+996${digits.slice(1)}`;
  }
  // Already includes country code
  if (digits.length >= 10) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export function phonesMatch(a: string, b: string): boolean {
  return normalizePhone(a) === normalizePhone(b);
}
