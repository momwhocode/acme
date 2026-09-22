import { FilterChipsHeader } from "./FilterChipsHeader.jsx"
import { Table } from "./Table.jsx"
import { TableEmpty } from "./TableEmpty.jsx"
import { TablePagination } from "./TablePagination.jsx"
import { hasSelectedListingFilters } from "../../lib/filterValues.js"

const FILTERED_EMPTY = {
  title: "No matching results",
  description: "Try another search or clear filters.",
  icon: "search",
  showAction: false
}

export function ListingTableCard({
  id = "listing-table",
  className = "",
  filterChips = [],
  filterValues = {},
  searchValue = "",
  searchPlaceholder = "Search",
  columnOptions = [],
  visibleColumnIds = [],
  onFilterChange,
  onSearchChange,
  onClearAll,
  onColumnToggle,
  showClearAll,
  showColumnsButton,
  clearGeneration,
  rows = [],
  isDatasetEmpty = false,
  hasActiveFilters = false,
  datasetEmptyProps = {
    title: "No employees yet",
    description: "Onboard an employee to start the directory.",
    icon: "group",
    showAction: false,
    regionLabel: "Empty directory"
  },
  tableColumns,
  tableType = "default",
  tableExtensions,
  skeletonRows,
  pagination,
  onPageChange
}) {
  const showFilteredEmpty = !isDatasetEmpty && rows.length === 0 && hasActiveFilters
  const clearAllVisible = showClearAll === false ? false : hasSelectedListingFilters(filterValues)

  return (
    <div className={[ "superadmin-tenants-table", className ].filter(Boolean).join(" ")}>
      <FilterChipsHeader
        id={`${id}-filters`}
        chips={filterChips}
        filterValues={filterValues}
        searchValue={searchValue}
        searchPlaceholder={searchPlaceholder}
        columnOptions={columnOptions}
        visibleColumnIds={visibleColumnIds}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
        onClearAll={onClearAll}
        onColumnToggle={onColumnToggle}
        showClearAll={clearAllVisible}
        showColumnsButton={showColumnsButton}
        clearGeneration={clearGeneration}
      />

      {isDatasetEmpty ? (
        <TableEmpty {...datasetEmptyProps} />
      ) : showFilteredEmpty ? (
        <TableEmpty {...FILTERED_EMPTY} />
      ) : (
        <div className="superadmin-tenants-table__results">
          <Table
            type={tableType}
            columns={tableColumns}
            rows={rows}
            extensions={tableExtensions}
            skeletonRows={skeletonRows}
          />
          {pagination ? (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              perPage={pagination.perPage}
              onPageChange={onPageChange}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
