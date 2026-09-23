/** Date range filter presets and helpers. */

import { formatAprilShortDate } from "../april/renderers/date-time.js";

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
