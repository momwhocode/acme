/** Home dashboard timeframe presets and as-of snapshot helpers. */

import { formatIsoDate } from "./dateRangePicker.js";

export const DEFAULT_HOME_TIMEFRAME = { preset: "lifetime" };

export const HOME_TIMEFRAME_PRESETS = [
  { value: "last_month", label: "Last Month" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "last_year", label: "Last Year" },
  { value: "lifetime", label: "Lifetime" },
];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function resolveHomeTimeframeBounds(value, referenceDate = new Date()) {
  switch (value?.preset) {
    case "last_month": {
      const from = startOfDay(new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1));
      const to = endOfDay(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0));
      return { from, to };
    }
    case "last_quarter": {
      const quarterStartMonth = Math.floor(referenceDate.getMonth() / 3) * 3;
      const from = startOfDay(new Date(referenceDate.getFullYear(), quarterStartMonth - 3, 1));
      const to = endOfDay(new Date(referenceDate.getFullYear(), quarterStartMonth, 0));
      return { from, to };
    }
    case "last_year": {
      const year = referenceDate.getFullYear() - 1;
      return {
        from: startOfDay(new Date(year, 0, 1)),
        to: endOfDay(new Date(year, 11, 31)),
      };
    }
    case "custom": {
      if (!value.from && !value.to) return null;
      const from = value.from ? startOfDay(new Date(`${value.from}T00:00:00`)) : null;
      const to = value.to ? endOfDay(new Date(`${value.to}T00:00:00`)) : null;
      return { from, to };
    }
    default:
      return null;
  }
}

export function homeTimeframeAsOf(value, referenceDate = new Date()) {
  if (value?.preset === "custom") {
    if (value.to) return value.to;
    if (value.from) return value.from;
    return formatIsoDate(referenceDate);
  }

  const bounds = resolveHomeTimeframeBounds(value, referenceDate);
  if (!bounds?.to) return formatIsoDate(referenceDate);
  return formatIsoDate(bounds.to);
}
