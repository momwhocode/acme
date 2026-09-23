/** Date range filter presets and helpers. */

import { formatAprilShortDate, parseListingDateTime } from "../april/renderers/date-time.js";
import { formatIsoDate } from "./dateRangePicker.js";

export { formatIsoDate };

export const DEFAULT_DATE_RANGE_FILTER = { preset: "lifetime" };

export const CREATED_ON_DATE_PRESETS = [
  { value: "lifetime", label: "Lifetime" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_week", label: "Last Week" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
];

const SHORT_MONTHS = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const PRESET_LABELS = Object.fromEntries(
  CREATED_ON_DATE_PRESETS.map((option) => [option.value, option.label])
);

export function isDateRangeFilterActive(value) {
  return Boolean(value?.preset && value.preset !== "lifetime");
}

export function dateRangeFilterGroups(value = DEFAULT_DATE_RANGE_FILTER, presets = CREATED_ON_DATE_PRESETS) {
  const preset = value?.preset ?? "lifetime";

  return [
    {
      label: "Select Date Range",
      items: presets.map((option) => ({
        ...option,
        selected: preset === option.value,
        state: preset === option.value ? "active" : "default",
      })),
      dividerAfter: true,
    },
    {
      items: [
        {
          value: "custom",
          label: "Custom",
          selected: preset === "custom",
          state: preset === "custom" ? "active" : "default",
        },
      ],
    },
  ];
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function resolveDateFilterBounds(value, referenceDate = new Date()) {
  if (!isDateRangeFilterActive(value)) return null;

  switch (value.preset) {
    case "today": {
      const day = startOfDay(referenceDate);
      return { from: day, to: endOfDay(referenceDate) };
    }
    case "yesterday": {
      const yesterday = new Date(referenceDate);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    }
    case "last_week": {
      const to = endOfDay(referenceDate);
      const from = startOfDay(referenceDate);
      from.setDate(from.getDate() - 6);
      return { from, to };
    }
    case "last_month": {
      const to = endOfDay(referenceDate);
      const from = startOfDay(referenceDate);
      from.setDate(from.getDate() - 29);
      return { from, to };
    }
    case "this_year": {
      const from = startOfDay(new Date(referenceDate.getFullYear(), 0, 1));
      return { from, to: endOfDay(referenceDate) };
    }
    case "last_year": {
      const year = referenceDate.getFullYear() - 1;
      const from = startOfDay(new Date(year, 0, 1));
      const to = endOfDay(new Date(year, 11, 31));
      return { from, to };
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

export function serializeDateRangeFilter(value, { fromKey, toKey }) {
  const bounds = resolveDateFilterBounds(value);
  if (!bounds) return {};

  const params = {};
  if (bounds.from) params[fromKey] = formatIsoDate(bounds.from);
  if (bounds.to) params[toKey] = formatIsoDate(bounds.to);
  return params;
}

export function serializeCreatedOnFilter(value) {
  return serializeDateRangeFilter(value, { fromKey: "created_from", toKey: "created_to" });
}

export function serializeDateJoinedFilter(value) {
  return serializeDateRangeFilter(value, { fromKey: "joined_from", toKey: "joined_to" });
}

export function serializeLastActiveFilter(value) {
  return serializeDateRangeFilter(value, { fromKey: "last_active_from", toKey: "last_active_to" });
}

export function matchesDateRangeFilter(rowValue, filterValue, referenceDate = new Date()) {
  const bounds = resolveDateFilterBounds(filterValue, referenceDate);
  if (!bounds) return true;

  const rowDate = parseRowDate(rowValue);
  if (!rowDate) return false;

  if (bounds.from && rowDate < bounds.from) return false;
  if (bounds.to && rowDate > bounds.to) return false;
  return true;
}

export function parseRowDate(value) {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();
  const listingDateTime = parseListingDateTime(text);
  if (listingDateTime) return listingDateTime;

  const shortMatch = text.match(/^(\d{1,2})\s+([A-Za-z]{3})-(\d{4})/);
  if (shortMatch) {
    const month = SHORT_MONTHS[shortMatch[2].toLowerCase()];
    if (month == null) return null;
    const parsed = new Date(Number(shortMatch[3]), month, Number(shortMatch[1]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function dateFilterDisplayLabel(filterLabel, value, options = {}) {
  const labels = {
    ...PRESET_LABELS,
    ...Object.fromEntries((options.presets || []).map((option) => [option.value, option.label])),
  };
  const showPeriod = options.showPeriod === true;
  const preset = value?.preset ?? "lifetime";

  if (preset === "custom") {
    if (value.from && value.to) {
      const range = `${formatAprilShortDate(`${value.from}T00:00:00`)} – ${formatAprilShortDate(`${value.to}T00:00:00`)}`;
      return showPeriod ? range : `${filterLabel}: ${range}`;
    }

    if (value.from) {
      const from = `From ${formatAprilShortDate(`${value.from}T00:00:00`)}`;
      return showPeriod ? from : `${filterLabel}: ${from}`;
    }

    if (value.to) {
      const until = `Until ${formatAprilShortDate(`${value.to}T00:00:00`)}`;
      return showPeriod ? until : `${filterLabel}: ${until}`;
    }

    return showPeriod ? "Custom" : `${filterLabel}: Custom`;
  }

  if (!isDateRangeFilterActive(value) && !showPeriod) return filterLabel;

  const period = labels[preset] ?? preset;
  return showPeriod ? period : `${filterLabel}: ${period}`;
}
