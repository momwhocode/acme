/** Checkbox selection for listing tables. Excluded ids stay unselectable. */

import { useMemo } from "react";

export function useTableRowSelection(
  rows,
  selectedIds,
  onSelectedIdsChange,
  { excludeRowId = null, excludeRowIds = [] } = {}
) {
  return useMemo(() => {
    const selectedSet = new Set(selectedIds);
    const excludedSet = new Set(excludeRowIds);
    if (excludeRowId != null) excludedSet.add(excludeRowId);
    const selectableRowIds = rows.map((row) => row.id).filter((id) => id != null && !excludedSet.has(id));
    const allSelected = selectableRowIds.length > 0 && selectableRowIds.every((id) => selectedSet.has(id));
    const someSelected = selectableRowIds.some((id) => selectedSet.has(id));

    return {
      selection: {
        allSelected,
        someSelected,
        isSelectable: (rowId) => !excludedSet.has(rowId),
        isSelected: (rowId) => selectedSet.has(rowId),
        onToggleRow: (rowId) => {
          if (excludedSet.has(rowId)) return;
          onSelectedIdsChange((current) =>
            current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId]
          );
        },
        onToggleAll: (checked) => {
          onSelectedIdsChange(checked ? selectableRowIds : []);
        },
      },
      selectedCount: selectedIds.filter((id) => !excludedSet.has(id)).length,
    };
  }, [rows, selectedIds, onSelectedIdsChange, excludeRowId, excludeRowIds]);
}
