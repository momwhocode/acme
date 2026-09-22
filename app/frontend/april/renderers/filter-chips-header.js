/** Filter chips header — composes base filter chips, Clear All, search, and columns control. */

const DEMO_FILTER_OPTIONS = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C" },
];

export const FILTER_CHIPS_HEADER_COLUMNS_ICON = "add_column_right";

/** Overflow modal fields when chip config omits `overflowFilters`. */
export const DEFAULT_OVERFLOW_FILTER_FIELDS = [
  { filterKey: "status", filterLabel: "Status" },
  { filterKey: "owner", filterLabel: "Owner" },
  { filterKey: "team", filterLabel: "Team" },
  { filterKey: "dateRange", filterLabel: "Date Range" },
];

export const DEFAULT_FILTER_CHIPS_HEADER_CHIPS = [
  { overflown: true, overflowFilters: DEFAULT_OVERFLOW_FILTER_FIELDS },
  {
    filterLabel: "Filter Label",
    filterKey: "filter_1",
    dropdownOptions: DEMO_FILTER_OPTIONS,
  },
  {
    filterLabel: "Filter Label",
    filterKey: "filter_2",
    dropdownOptions: DEMO_FILTER_OPTIONS,
  },
  {
    filterLabel: "Filter Label",
    filterKey: "filter_3",
    dropdownOptions: DEMO_FILTER_OPTIONS,
  },
  {
    filterLabel: "Filter Label",
    filterKey: "filter_4",
    dropdownOptions: DEMO_FILTER_OPTIONS,
  },
  {
    filterLabel: "Filter Label",
    filterKey: "filter_5",
    dropdownOptions: DEMO_FILTER_OPTIONS,
  },
];

/** Demo filter values — third chip shows active badge with count 3. */
export const DEFAULT_FILTER_CHIPS_HEADER_FILTER_VALUES = {
  filter_3: ["a", "b", "c"],
};
