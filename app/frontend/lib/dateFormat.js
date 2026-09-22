import { formatIsoDate, parseIsoDate, startOfDay } from "./dateRangePicker.js";

/** Display ISO `YYYY-MM-DD` as `MM/DD/YYYY` for April date fields. */
export function formatDisplayDate(isoValue) {
  const date = parseIsoDate(isoValue);
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}/${date.getFullYear()}`;
}

/**
 * Parse typed date text into ISO `YYYY-MM-DD`.
 * Accepts `MM/DD/YYYY`, `M/D/YYYY`, and `YYYY-MM-DD`. Returns `""` when empty/invalid.
 */
export function parseDisplayDate(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = parseIsoDate(raw);
    return date ? formatIsoDate(date) : "";
  }

  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";

  const date = startOfDay(new Date(year, month - 1, day));
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return "";
  }

  return formatIsoDate(date);
}
