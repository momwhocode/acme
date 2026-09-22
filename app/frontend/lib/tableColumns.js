/** Helpers for table column visibility toggles. */

function isAlwaysVisibleColumn(column) {
  return (
    column.kind === "select" ||
    column.kind === "lead" ||
    column.kind === "actions" ||
    column.toggleable === false
  );
}

export function toggleableColumns(columns = []) {
  return columns
    .filter((column) => column.label && !isAlwaysVisibleColumn(column))
    .map(({ id, label }) => ({ id, label }));
}

export function defaultVisibleColumnIds(columns = []) {
  return toggleableColumns(columns).map((column) => column.id);
}

export function filterTableColumns(columns = [], visibleColumnIds = []) {
  const visible = new Set(visibleColumnIds);
  return columns.filter((column) => isAlwaysVisibleColumn(column) || visible.has(column.id));
}

export function toggleColumnVisibility(visibleIds, columnId) {
  if (columnId === "all") {
    return visibleIds;
  }
  if (visibleIds.includes(columnId)) {
    const next = visibleIds.filter((id) => id !== columnId);
    return next.length > 0 ? next : visibleIds;
  }
  return [...visibleIds, columnId];
}

export function areAllColumnsVisible(visibleIds = [], allIds = []) {
  return allIds.length > 0 && allIds.every((id) => visibleIds.includes(id));
}

/** Apply a columns-menu toggle, including the synthetic "All" select/unselect option. */
export function applyColumnVisibilityToggle(visibleIds, columnId, allIds = []) {
  if (columnId === "all") {
    if (!allIds.length) return visibleIds;
    return areAllColumnsVisible(visibleIds, allIds) ? [] : [...allIds];
  }
  return toggleColumnVisibility(visibleIds, columnId);
}

export function createColumnToggleHandler(columns, setVisibleColumnIds) {
  const allIds = defaultVisibleColumnIds(columns);
  return (columnId) => {
    setVisibleColumnIds((current) => applyColumnVisibilityToggle(current, columnId, allIds));
  };
}
