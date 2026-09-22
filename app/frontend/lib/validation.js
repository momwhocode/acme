/** Normalize phone to digits; strip leading 91 country code when 12 digits. */
export function digitsOnlyPhone(value) {
  const digits = String(value || "").replace(/\D/g, "")
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2)
  return digits
}
