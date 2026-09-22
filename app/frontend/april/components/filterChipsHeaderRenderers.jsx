import { BaseFilterChip } from "./BaseFilterChip.jsx";
import { FilterChipDateRange } from "./FilterChipDateRange.jsx";
import { FilterChipDropdown } from "./FilterChipDropdown.jsx";
import { FilterChipOverflow } from "./FilterChipOverflow.jsx";

function resolveFilterKey(chip, index) {
  return chip.filterKey ?? chip.filterLabel?.toLowerCase().replace(/\s+/g, "_") ?? `filter_${index}`;
}

function renderFilterChip(chip, { chipId, filterKey, filterValues, onFilterChange, clearGeneration }) {
  if (chip.overflown) {
    return (
      <FilterChipOverflow
        id={chipId}
        overflowFilters={chip.overflowFilters}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
      />
    );
  }

  if (chip.dateRangeFilter) {
    return (
      <FilterChipDateRange
        id={chipId}
        filterLabel={chip.filterLabel}
        value={filterValues[filterKey]}
        onChange={(next) => onFilterChange?.(filterKey, next)}
      />
    );
  }

  if (chip.dropdownOptions) {
    return (
      <FilterChipDropdown
        id={chipId}
        filterLabel={chip.filterLabel}
        options={chip.dropdownOptions}
        value={filterValues[filterKey] ?? []}
        onChange={(next) => onFilterChange?.(filterKey, next)}
        clearGeneration={clearGeneration}
      />
    );
  }

  return <BaseFilterChip {...chip} id={chipId} onClick={chip.onClick} />;
}

export { renderFilterChip, resolveFilterKey };
