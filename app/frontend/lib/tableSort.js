/** Table sort state helpers. */

export function isSortableColumn(column) {
  return Boolean(column?.sortable || column?.kind === "sortable-header");
}

// First click on a column sorts desc (pay / dates read better that way).
export function nextSortState(current, columnId) {
  if (current.columnId !== columnId) {
    return { columnId, direction: "desc" };
  }

  return {
    columnId,
    direction: current.direction === "desc" ? "asc" : "desc",
  };
}

export function applySortToColumns(columns = [], sort = { columnId: null, direction: "desc" }) {
  return columns.map((column) => ({
    ...column,
    sortActive: column.id === sort.columnId,
    sortDirection: column.id === sort.columnId ? sort.direction : undefined,
  }));
}
