/** Parse `HH:mm` (24h) into parts. Returns null when invalid. */
export function parseTimeValue(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours24 = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours24) || !Number.isInteger(minutes)) return null;
  if (hours24 < 0 || hours24 > 23 || minutes < 0 || minutes > 59) return null;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return { hours24, hours12, minutes, period };
}

/** Format `HH:mm` for April time fields as `hh:mm AM/PM`. */
export function formatDisplayTime(value) {
  const parsed = parseTimeValue(value);
  if (!parsed) return "";
  return `${String(parsed.hours12).padStart(2, "0")}:${String(parsed.minutes).padStart(2, "0")} ${parsed.period}`;
}

/** Build `HH:mm` from 12h parts. */
export function toTimeValue(hours12, minutes, period) {
  const hour = Number(hours12);
  const minute = Number(minutes);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return "";
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return "";
  const normalizedPeriod = String(period).toUpperCase() === "PM" ? "PM" : "AM";
  let hours24 = hour % 12;
  if (normalizedPeriod === "PM") hours24 += 12;
  return `${String(hours24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
