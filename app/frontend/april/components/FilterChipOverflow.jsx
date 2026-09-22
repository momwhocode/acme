import { useMemo, useState } from "react";
import { countActiveFilters } from "../../lib/filterValues.js";
import { DEFAULT_OVERFLOW_FILTER_FIELDS } from "../renderers/filter-chips-header.js";
import { BaseFilterChip } from "./BaseFilterChip.jsx";
import { FilterModal } from "./FilterModal.jsx";

/** Overflow filter chip — opens the filter modal for filters that do not fit in the header bar. */
export function FilterChipOverflow({
  id = "filter-chip-overflow",
  overflowFilters = DEFAULT_OVERFLOW_FILTER_FIELDS,
  filterValues = {},
  onFilterChange,
}) {
  const [open, setOpen] = useState(false);
  const filterKeys = useMemo(
    () => overflowFilters.map((field) => field.filterKey).filter(Boolean),
    [overflowFilters]
  );
  const activeCount = countActiveFilters(filterKeys, filterValues);
  const active = activeCount > 0 || open;

  return (
    <>
      <BaseFilterChip
        id={`${id}-trigger`}
        overflown
        active={active}
        badgeValue={activeCount > 0 ? String(activeCount) : null}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      />
      <FilterModal
        open={open}
        id={id}
        fields={overflowFilters}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}
