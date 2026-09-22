import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const TABLE_REORDER_COLUMN = {
  id: "__reorder",
  kind: "reorder",
  label: "",
  sortable: false,
};

export function withTableReorderColumn(columns = [], enabled = false) {
  if (!enabled) return columns;
  if (columns.some((column) => column.id === TABLE_REORDER_COLUMN.id)) return columns;
  return [TABLE_REORDER_COLUMN, ...columns];
}

export function useTableRowReorderSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
}

export function reorderRowIds(rowIds, activeId, overId) {
  const oldIndex = rowIds.indexOf(activeId);
  const newIndex = rowIds.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return null;
  return arrayMove(rowIds, oldIndex, newIndex);
}

export function TableReorderHandle({ label, disabled = false, attributes, listeners }) {
  return (
    <button
      type="button"
      className="april-table__drag-handle"
      aria-label={`Reorder ${label}`}
      title="Drag to reorder"
      disabled={disabled}
      {...attributes}
      {...listeners}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        drag_indicator
      </span>
    </button>
  );
}

/** Sortable `<tr>` wrapper for listing tables. */
export function SortableTableRow({ rowId, disabled = false, className = "", children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rowId,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={[className, isDragging ? "april-table__row--dragging" : ""].filter(Boolean).join(" ")}
      data-dragging={isDragging ? "true" : undefined}
    >
      {typeof children === "function" ? children({ attributes, listeners, isDragging }) : children}
    </tr>
  );
}
