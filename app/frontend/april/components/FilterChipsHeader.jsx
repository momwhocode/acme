import { Fragment, useState } from "react";
import {
  DEFAULT_FILTER_CHIPS_HEADER_CHIPS,
  FILTER_CHIPS_HEADER_COLUMNS_ICON,
} from "../renderers/filter-chips-header.js";
import { Button } from "./Button.jsx";
import { TableColumnsDropdown } from "./TableColumnsDropdown.jsx";
import { TextInput } from "./TextInput.jsx";
import { renderFilterChip, resolveFilterKey } from "./filterChipsHeaderRenderers.jsx";

export function FilterChipsHeader({
  chips = DEFAULT_FILTER_CHIPS_HEADER_CHIPS,
  showSearch = true,
  showColumnsButton = true,
  showClearAll = true,
  clearAllLabel = "Clear all",
  searchPlaceholder = "Search",
  columnsButtonIcon = FILTER_CHIPS_HEADER_COLUMNS_ICON,
  columnsButtonLabel = "Show or hide columns",
  columnsGroupLabel = "Show/hide Columns",
  id = "filter-chips-header",
  className = "",
  filterValues = {},
  searchValue,
  onFilterChange,
  onClearAll,
  onSearchChange,
  columnOptions,
  visibleColumnIds,
  onColumnToggle,
  clearGeneration = 0,
  endContent = null,
  ariaLabel = "Table filters",
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const isSearchControlled = searchValue !== undefined;
  const search = isSearchControlled ? searchValue : internalSearch;

  const handleSearchInput = (event) => {
    const value = event.target.value;
    if (!isSearchControlled) setInternalSearch(value);
    onSearchChange?.(value);
  };

  const handleSearchClear = () => {
    if (!isSearchControlled) setInternalSearch("");
    onSearchChange?.("");
  };

  return (
    <header
      className={["april-filter-chips-header", className].filter(Boolean).join(" ")}
      id={id}
      aria-label={ariaLabel}
    >
      {chips.length > 0 || showClearAll ? (
        <div className="april-filter-chips-header__start">
          {chips.length > 0 ? (
            <div className="april-filter-chips-header__chips" role="toolbar" aria-label="Filter chips">
              {chips.map((chip, index) => {
                const chipId = `${id}-chip-${index}`;
                const filterKey = resolveFilterKey(chip, index);

                return (
                  <Fragment key={chipId}>
                    {renderFilterChip(chip, {
                      chipId,
                      filterKey,
                      filterValues,
                      onFilterChange,
                      clearGeneration,
                    })}
                  </Fragment>
                );
              })}
            </div>
          ) : null}
          {showClearAll ? (
            <Button
              label={clearAllLabel}
              variant="link-neutral"
              size="md"
              leadingIcon={false}
              trailingIcon={false}
              onMouseDown={(event) => {
                event.preventDefault();
                onClearAll?.();
              }}
              onClick={(event) => {
                event.currentTarget.blur();
              }}
            />
          ) : null}
        </div>
      ) : null}
      <div className="april-filter-chips-header__end">
        {endContent}
        {showSearch ? (
          <div className="april-filter-chips-header__search">
            <TextInput
              id={`${id}-search`}
              size="md"
              showLabel={false}
              showDescription={false}
              leadingIcon
              trailingIcon={false}
              leadingIconName="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchInput}
              clearable
              clearLabel="Clear search"
              onClear={handleSearchClear}
              fullWidth
            />
          </div>
        ) : null}
        {showColumnsButton ? (
          <TableColumnsDropdown
            id={`${id}-columns`}
            icon={columnsButtonIcon}
            ariaLabel={columnsButtonLabel}
            variant="outlined"
            size="md"
            groupLabel={columnsGroupLabel}
            options={columnOptions ?? []}
            visibleColumnIds={visibleColumnIds ?? []}
            onToggle={onColumnToggle}
          />
        ) : null}
      </div>
    </header>
  );
}
