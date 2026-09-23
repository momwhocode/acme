/** Normalized multiselect filter values. */

import { isDateRangeFilterActive } from "./dateFilter.js";

export const ALL_FILTER_OPTION = { value: "all", label: "All" };

export function withAllFilterOption(options = []) {
  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );
  if (normalized.some((option) => option.value === "all")) return normalized;
  return [ALL_FILTER_OPTION, ...normalized];
}

function specificOptionValues(options = []) {
  return withAllFilterOption(options)
    .filter((option) => option.value !== "all")
    .map((option) => option.value);
}

/** Raw selected values from storage (never includes the All sentinel). */
export function readFilterSelection(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && entry !== "all");
  if (!value || value === "all") return [];
  return [value];
}

export function isNoneFilterSelected(value) {
  return readFilterSelection(value).length === 0;
}

export function isAllFilterSelected(value, options = []) {
  const specific = specificOptionValues(options);
  const selected = readFilterSelection(value);
  return specific.length > 0 && specific.every((entry) => selected.includes(entry));
}

/** Badge count — partial selections only; none and all both return 0. */
export function filterSelectionBadgeCount(value, options = []) {
  const selected = readFilterSelection(value);
  if (selected.length === 0) return 0;
  if (isAllFilterSelected(value, options)) return 0;
  return selected.length;
}

export function isFilterActive(value, options = null) {
  if (options) return filterSelectionBadgeCount(value, options) > 0;
  return readFilterSelection(value).length > 0;
}

export function toggleFilterSelection(current, optionValue, optionValues = []) {
  const optionsWithAll = withAllFilterOption(optionValues);
  const specificValues = specificOptionValues(optionsWithAll);
  const selected = readFilterSelection(current);

  if (optionValue === "all") {
    if (isAllFilterSelected(current, optionValues)) return [];
    return [...specificValues];
  }

  if (selected.includes(optionValue)) {
    return selected.filter((value) => value !== optionValue);
  }

  return [...selected, optionValue];
}

export function filterOptionsToSelectGroups(options, value) {
  const optionsWithAll = withAllFilterOption(options);
  const selected = readFilterSelection(value);
  const allSelected = isAllFilterSelected(value, options);
  const someSelected = !isNoneFilterSelected(value) && !allSelected;

  return [
    {
      items: optionsWithAll.map((option) => {
        if (option.value === "all") {
          return {
            ...option,
            selected: allSelected,
            indeterminate: someSelected,
          };
        }
        return {
          ...option,
          selected: selected.includes(option.value),
        };
      }),
    },
  ];
}

export function countActiveFilters(filterKeys, filterValues = {}) {
  return filterKeys.reduce((count, key) => count + (isFilterActive(filterValues[key]) ? 1 : 0), 0);
}

/** True when any filter chip has a selection. Search is not a chip filter. */
export function hasSelectedListingFilters(filterValues = {}) {
  return Object.values(filterValues).some((value) => {
    if (value && typeof value === "object" && !Array.isArray(value) && "preset" in value) {
      return isDateRangeFilterActive(value);
    }
    return isFilterActive(value);
  });
}
