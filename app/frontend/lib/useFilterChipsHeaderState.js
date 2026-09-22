import { useMemo, useState } from "react";
import { createColumnToggleHandler, defaultVisibleColumnIds, toggleableColumns } from "./tableColumns.js";

/** Shared filter-chips-header state for listing shells and Storybook demos. */
export function useFilterChipsHeaderState({
  columns = [],
  initialFilterValues = {},
  searchValue: controlledSearch,
  initialSearch = "",
} = {}) {
  const [filterValues, setFilterValues] = useState(initialFilterValues);
  const [visibleColumnIds, setVisibleColumnIds] = useState(() => defaultVisibleColumnIds(columns));
  const [internalSearch, setInternalSearch] = useState(initialSearch);
  const [clearGeneration, setClearGeneration] = useState(0);
  const isSearchControlled = controlledSearch !== undefined;
  const search = isSearchControlled ? controlledSearch : internalSearch;

  const columnOptions = useMemo(() => toggleableColumns(columns), [columns]);
  const onColumnToggle = useMemo(() => createColumnToggleHandler(columns, setVisibleColumnIds), [columns]);

  const onFilterChange = (filterKey, value) => {
    setFilterValues((current) => ({ ...current, [filterKey]: value }));
  };

  const onClearAll = () => {
    setFilterValues({});
    setClearGeneration((current) => current + 1);
    if (!isSearchControlled) setInternalSearch("");
  };

  const onSearchChange = (value) => {
    if (!isSearchControlled) setInternalSearch(value);
  };

  return {
    filterValues,
    searchValue: search,
    columnOptions,
    visibleColumnIds,
    clearGeneration,
    onFilterChange,
    onClearAll,
    onSearchChange,
    onColumnToggle,
  };
}
