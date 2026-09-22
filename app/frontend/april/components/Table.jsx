import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, DragOverlay, closestCenter, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { formatAprilShortDate, formatTableDateValue, isTableDateColumn } from "../renderers/date-time.js";
import { useTableColumnTransition } from "../../lib/useTableColumnTransition.js";
import { useTableScrollOverflow } from "../../lib/useTableScrollOverflow.js";
import { isSortableColumn } from "../../lib/tableSort.js";
import { UserAvatar } from "./UserAvatar.jsx";
import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";
import { TableEmpty } from "./TableEmpty.jsx";
import { Tag } from "./Tag.jsx";
import {
  SortableTableRow,
  TableReorderHandle,
  reorderRowIds,
  useTableRowReorderSensors,
  withTableReorderColumn,
} from "./tableRowReorder.jsx";

function TableSelectCheckbox({
  id,
  checked = false,
  indeterminate = false,
  disabled = false,
  ariaLabel,
  onToggle,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  const classes = [
    "april-selector",
    "april-selector--checkbox",
    "april-selector--default",
    "april-selector--control-only",
    "april-selector--interactive",
    "april-table__select-control",
    checked || indeterminate ? "april-selector--checked" : "",
    indeterminate ? "april-selector--indeterminate" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes} htmlFor={id}>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        className="april-table__select-input"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onToggle?.(event.target.checked)}
      />
      <span className="april-selector__box" aria-hidden="true">
        {indeterminate ? (
          <svg
            className="april-selector__indeterminate-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="9"
            height="7"
            viewBox="0 0 9 7"
            fill="none"
          >
            <path d="M1 3.5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : checked ? (
          <svg
            className="april-selector__check-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="9"
            height="7"
            viewBox="0 0 9 7"
            fill="none"
          >
            <path
              d="M0.75 3.25L3.25 5.75L8.25 0.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
    </label>
  );
}

function cellStickyClass(column) {
  if (column.sticky === "start") return " april-table__cell--sticky-start";
  if (column.sticky === "end") return " april-table__cell--sticky-end";
  return "";
}

function cellKindClass(column) {
  if (column.kind === "select") return " april-table__cell--select";
  if (column.kind === "reorder") return " april-table__cell--reorder";
  if (column.kind === "lead") return " april-table__cell--lead april-table__cell--primary";
  if (column.kind === "status") return " april-table__cell--status";
  if (column.kind === "actions") return " april-table__cell--actions";
  return "";
}

function cellSortedClass(column) {
  return column.sortActive ? " april-table__cell--sorted" : "";
}

function cellScrollFrameClass(column) {
  if (column.scroll === true || column.scroll === "start" || column.scroll === "end") {
    return " april-table__cell--scroll-zone";
  }
  return "";
}

function isScrollZoneColumn(column) {
  return column.scroll === true || column.scroll === "start" || column.scroll === "end";
}

function cellScrollDividerClass(column) {
  if (column.kind === "lead" && column.sticky === "start") {
    return " april-table__cell--scroll-divider-start";
  }
  if (column.kind === "actions" && column.sticky === "end") {
    return " april-table__cell--scroll-divider-end";
  }
  return "";
}

function columnPhaseClass(phase) {
  if (phase === "exiting") return " april-table__cell--column-exiting";
  if (phase === "entering") return " april-table__cell--column-entering";
  return "";
}

function colPhaseClass(phase) {
  if (phase === "exiting") return " april-table__col--column-exiting";
  if (phase === "entering") return " april-table__col--column-entering";
  return "";
}

function tableCellClasses(column, extensions, columnPhase) {
  const extraKind = extensions?.cellKindClass?.(column) ?? "";
  return `april-table__cell${cellKindClass(column)}${extraKind}${cellStickyClass(column)}${cellSortedClass(column)}${cellScrollFrameClass(column)}${cellScrollDividerClass(column)}${columnPhaseClass(columnPhase)}`;
}

function tableColClass(column, columnPhase) {
  const base = tableColKindClass(column);
  return `${base}${colPhaseClass(columnPhase)}`.trim();
}

function tableColKindClass(column) {
  if (column.kind === "select") return "april-table__col--select";
  if (column.kind === "reorder") return "april-table__col--reorder";
  if (column.kind === "lead") return "april-table__col--lead april-table__col--flex";
  if (column.kind === "actions") return "april-table__col--actions";
  if (isScrollZoneColumn(column)) return "april-table__col--scroll";
  return "";
}

function TableColgroup({ columns, getColumnPhase }) {
  return (
    <colgroup>
      {columns.map((column) => (
        <col key={column.id} className={tableColClass(column, getColumnPhase?.(column.id))} />
      ))}
    </colgroup>
  );
}

function TableHeaderButton({ label, sortActive = false, sortDirection = "desc", sortable = false, onSort }) {
  const handleClick = (event) => {
    onSort?.();
    event.currentTarget.blur();
  };

  return (
    <Button
      label={label}
      variant="link-neutral"
      size="md"
      leadingIcon={false}
      trailingIcon={sortable && sortActive}
      trailingIconName={sortDirection === "asc" ? "arrow_upward" : "arrow_downward"}
      onClick={sortable ? handleClick : undefined}
    />
  );
}

function TablePlaceholder({ width = "100%" }) {
  return <span className="april-table__placeholder" style={{ width }} />;
}

function blurOnPointerClick(handler) {
  return (event) => {
    handler?.(event);
    event.currentTarget.blur();
  };
}

function TableLeadCell({ row, column }) {
  return (
    <div className="april-table__lead">
      {column.showAvatar ? <UserAvatar user={row} size="md" /> : null}
      <Button
        label={row.name}
        variant="link"
        size="md"
        leadingIcon={false}
        trailingIcon={false}
        onClick={blurOnPointerClick()}
      />
    </div>
  );
}

function TablePersonCell({ person }) {
  if (!person?.name) return "—";
  return (
    <div className="april-table__person">
      <UserAvatar user={person} size="md" />
      <span>{person.name}</span>
    </div>
  );
}

function TableSkeletonCell({ kind, column }) {
  if (kind === "select") {
    return <span className="april-table__placeholder april-table__placeholder--checkbox" />;
  }
  if (kind === "lead") {
    return column?.showAvatar ? (
      <div className="april-table__lead-skeleton">
        <span className="april-table__placeholder april-table__placeholder--avatar" />
        <TablePlaceholder width="89px" />
      </div>
    ) : (
      <TablePlaceholder width="89px" />
    );
  }
  if (kind === "status") return <TablePlaceholder width="72px" />;
  if (kind === "actions") {
    return (
      <div className="april-table__actions-skeleton">
        <TablePlaceholder width="48px" />
        <TablePlaceholder width="32px" />
      </div>
    );
  }
  if (kind === "person") {
    return (
      <div className="april-table__lead-skeleton">
        <span className="april-table__placeholder april-table__placeholder--avatar" />
        <TablePlaceholder width="72px" />
      </div>
    );
  }
  if (kind === "datetime" || kind === "date") return <TablePlaceholder width="168px" />;
  return <TablePlaceholder width="89px" />;
}

function isDateLikeColumn(column) {
  return column.kind === "datetime" || column.kind === "date" || isTableDateColumn(column.id);
}

function skeletonKindForColumn(column, extensions) {
  const custom = extensions?.skeletonKind?.(column);
  if (custom) return custom;
  if (column.kind === "select" || column.kind === "lead" || column.kind === "person") return column.kind;
  if (column.kind === "reorder") return "actions";
  if (column.kind === "status") return "status";
  if (column.kind === "actions") return "actions";
  if (isDateLikeColumn(column)) return column.kind === "date" ? "date" : "datetime";
  return "text";
}

function ariaSortValue(column) {
  if (!isSortableColumn(column)) return undefined;
  if (!column.sortActive) return "none";
  return column.sortDirection === "asc" ? "ascending" : "descending";
}

function TableHeaderCell({ column, extensions, onSort, selection, getColumnPhase }) {
  const classes = tableCellClasses(column, extensions, getColumnPhase?.(column.id));
  const sortable = isSortableColumn(column);
  const handleSort = sortable && onSort ? () => onSort(column.id) : undefined;

  if (column.kind === "reorder") {
    return <th className={classes} scope="col" aria-label="Reorder" />;
  }

  if (column.kind === "select") {
    const selectable = Boolean(selection);
    const allSelected = selection?.allSelected ?? false;
    const someSelected = selection?.someSelected ?? false;

    return (
      <th className={classes} scope="col">
        <TableSelectCheckbox
          id={`table-select-all-${column.id}`}
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          disabled={!selectable}
          ariaLabel="Select all rows"
          onToggle={(checked) => selection?.onToggleAll?.(checked)}
        />
      </th>
    );
  }

  if (column.kind === "actions") {
    return (
      <th className={classes} scope="col">
        <span className="april-table__sr-only">Actions</span>
      </th>
    );
  }

  const label = column.label ?? "";
  const headerClasses = `${classes} april-table__cell--header`;

  if (!sortable || !label) {
    return (
      <th className={headerClasses} scope="col">
        {label ? <TableHeaderButton label={label} /> : null}
      </th>
    );
  }

  return (
    <th className={headerClasses} scope="col" aria-sort={ariaSortValue(column)}>
      <TableHeaderButton
        label={label}
        sortActive={column.sortActive}
        sortDirection={column.sortDirection ?? "desc"}
        sortable
        onSort={handleSort}
      />
    </th>
  );
}

function TableActionsCell() {
  return (
    <div className="april-table__actions">
      <IconButton
        variant="outlined"
        size="md"
        icon="more_vert"
        ariaLabel="Row actions"
        onClick={blurOnPointerClick()}
      />
    </div>
  );
}

function TableBodyCell({
  column,
  row,
  rowId,
  extensions,
  selection,
  getColumnPhase,
  dragHandleProps,
  reorderDisabled,
}) {
  const classes = tableCellClasses(column, extensions, getColumnPhase?.(column.id));

  if (column.kind === "reorder") {
    return (
      <td className={classes}>
        <TableReorderHandle
          label={row.name || String(rowId)}
          disabled={reorderDisabled}
          attributes={dragHandleProps?.attributes}
          listeners={dragHandleProps?.listeners}
        />
      </td>
    );
  }

  const custom = extensions?.renderBodyContent?.(column, row);

  if (custom !== undefined) {
    return <td className={classes}>{custom}</td>;
  }

  if (column.kind === "select") {
    const selectable = Boolean(selection) && (selection?.isSelectable?.(rowId) ?? true);
    const isSelected = selection?.isSelected?.(rowId) ?? Boolean(row.selected);

    return (
      <td className={classes}>
        <TableSelectCheckbox
          id={`table-select-${rowId}`}
          checked={isSelected}
          disabled={!selectable}
          ariaLabel={`Select row ${row.name || rowId}`}
          onToggle={() => selection?.onToggleRow?.(rowId)}
        />
      </td>
    );
  }

  if (column.kind === "lead") {
    return (
      <td className={classes}>
        <TableLeadCell row={row} column={column} />
      </td>
    );
  }

  if (column.kind === "status") {
    return (
      <td className={classes}>
        <Tag type={row.statusType} label={row.status} leadingIcon={false} trailingIcon={false} />
      </td>
    );
  }

  if (column.kind === "actions") {
    return (
      <td className={classes}>
        <TableActionsCell />
      </td>
    );
  }

  if (column.kind === "person") {
    return (
      <td className={classes}>
        <TablePersonCell person={row[column.id]} />
      </td>
    );
  }

  if (isDateLikeColumn(column)) {
    const formatted =
      column.kind === "date"
        ? formatAprilShortDate(row[column.id])
        : formatTableDateValue(column.id, row[column.id]);
    return (
      <td className={classes}>
        <span className="april-table__cell-text">{formatted}</span>
      </td>
    );
  }

  return (
    <td className={classes}>
      <span className="april-table__cell-text">{row[column.id] ?? "—"}</span>
    </td>
  );
}

function TableSkeletonRow({ columns, extensions, getColumnPhase }) {
  return (
    <tr className="april-table__row april-table__row--skeleton" aria-hidden="true">
      {columns.map((column) => (
        <td key={column.id} className={tableCellClasses(column, extensions, getColumnPhase?.(column.id))}>
          <TableSkeletonCell kind={skeletonKindForColumn(column, extensions)} column={column} />
        </td>
      ))}
    </tr>
  );
}

function TableDataRow({
  columns,
  row,
  rowId,
  extensions,
  selection,
  getColumnPhase,
  rowReorderEnabled = false,
  reorderDisabled = false,
}) {
  const isSelected = selection?.isSelected?.(rowId) ?? Boolean(row.selected);
  const rowClass = `april-table__row${isSelected ? " april-table__row--selected" : ""}`;

  const renderCells = (dragHandleProps) =>
    columns.map((column) => (
      <TableBodyCell
        key={column.id}
        column={column}
        row={row}
        rowId={rowId}
        extensions={extensions}
        selection={selection}
        getColumnPhase={getColumnPhase}
        dragHandleProps={dragHandleProps}
        reorderDisabled={reorderDisabled}
      />
    ));

  if (!rowReorderEnabled) {
    return <tr className={rowClass}>{renderCells(null)}</tr>;
  }

  return (
    <SortableTableRow rowId={rowId} disabled={reorderDisabled} className={rowClass}>
      {({ attributes, listeners }) => renderCells({ attributes, listeners })}
    </SortableTableRow>
  );
}

function resolveRowId(row, index, getRowId) {
  if (getRowId) return getRowId(row, index);
  if (row.id != null) return row.id;
  return index;
}

function TableBody({
  type,
  columns,
  rows,
  loadedRows,
  skeletonRows,
  extensions,
  selection,
  getRowId,
  getColumnPhase,
  rowReorderEnabled = false,
  reorderDisabled = false,
}) {
  if (type === "loading") {
    return Array.from({ length: skeletonRows }, (_, index) => (
      <TableSkeletonRow
        key={`skeleton-${index}`}
        columns={columns}
        extensions={extensions}
        getColumnPhase={getColumnPhase}
      />
    ));
  }

  if (type === "partially-loading") {
    const resolvedLoadedRows = Math.min(Math.max(loadedRows, 0), rows.length);
    const loaded = rows
      .slice(0, resolvedLoadedRows)
      .map((row, index) => (
        <TableDataRow
          key={`row-${resolveRowId(row, index, getRowId)}`}
          columns={columns}
          row={row}
          rowId={resolveRowId(row, index, getRowId)}
          extensions={extensions}
          selection={selection}
          getColumnPhase={getColumnPhase}
          rowReorderEnabled={rowReorderEnabled}
          reorderDisabled={reorderDisabled}
        />
      ));
    const skeleton = Array.from({ length: Math.max(0, skeletonRows - resolvedLoadedRows) }, (_, index) => (
      <TableSkeletonRow
        key={`partial-skeleton-${index}`}
        columns={columns}
        extensions={extensions}
        getColumnPhase={getColumnPhase}
      />
    ));
    return [...loaded, ...skeleton];
  }

  return rows.map((row, index) => (
    <TableDataRow
      key={`row-${resolveRowId(row, index, getRowId)}`}
      columns={columns}
      row={row}
      rowId={resolveRowId(row, index, getRowId)}
      extensions={extensions}
      selection={selection}
      getColumnPhase={getColumnPhase}
      rowReorderEnabled={rowReorderEnabled}
      reorderDisabled={reorderDisabled}
    />
  ));
}

/** Data table — React implementation with optional cell extensions */
export function Table({
  type = "default",
  columns = [],
  rows = [],
  loadedRows = 4,
  skeletonRows = 4,
  extensions,
  onSort,
  selection,
  getRowId,
  emptyTitle,
  emptyDescription,
  emptyAction,
  animateColumnChanges = true,
  className = "",
  /** `{ enabled, disabled, onReorder(orderedIds) }` — drag handle column + row sorting. */
  rowReorder = null,
}) {
  const isEmpty = type === "empty";
  const rowReorderEnabled = Boolean(rowReorder?.enabled) && type === "default" && rows.length > 1;
  const reorderDisabled = Boolean(rowReorder?.disabled);
  const sensors = useTableRowReorderSensors();
  const [activeDragId, setActiveDragId] = useState(null);

  const columnsWithReorder = useMemo(
    () => withTableReorderColumn(columns, rowReorderEnabled),
    [columns, rowReorderEnabled]
  );
  const columnTransition = useTableColumnTransition(isEmpty ? [] : columnsWithReorder);
  const displayColumns = animateColumnChanges ? columnTransition.displayColumns : columnsWithReorder;
  const getColumnPhase = animateColumnChanges ? columnTransition.getColumnPhase : () => "stable";
  const isAnimating = animateColumnChanges && columnTransition.isAnimating;
  const columnLayoutKey = useMemo(
    () => displayColumns.map((column) => column.id).join("|"),
    [displayColumns]
  );
  const scrollRef = useRef(null);
  useTableScrollOverflow(
    scrollRef,
    `${columnLayoutKey}:${type}:${rows.length}:${loadedRows}:${skeletonRows}`,
    isAnimating
  );

  const rowIds = useMemo(
    () => rows.map((row, index) => String(resolveRowId(row, index, getRowId))),
    [rows, getRowId]
  );

  if (isEmpty) {
    return (
      <TableEmpty
        className={className}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyAction}
      />
    );
  }

  const busy = type === "loading" || type === "partially-loading";
  const tableClass = ["april-table", isAnimating ? "april-table--column-animating" : ""]
    .filter(Boolean)
    .join(" ");

  const activeDragRow = activeDragId
    ? rows.find((row, index) => String(resolveRowId(row, index, getRowId)) === String(activeDragId))
    : null;

  const table = (
    <div className={["april-table-shell", `april-table-shell--${type}`, className].filter(Boolean).join(" ")}>
      <div className="april-table-shell__scroll" ref={scrollRef}>
        <table className={tableClass} aria-busy={busy || undefined}>
          <TableColgroup columns={displayColumns} getColumnPhase={getColumnPhase} />
          <thead>
            <tr>
              {displayColumns.map((column) => (
                <TableHeaderCell
                  key={column.id}
                  column={column}
                  extensions={extensions}
                  onSort={onSort}
                  selection={selection}
                  getColumnPhase={getColumnPhase}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {rowReorderEnabled ? (
              <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                <TableBody
                  type={type}
                  columns={displayColumns}
                  rows={rows}
                  loadedRows={loadedRows}
                  skeletonRows={skeletonRows}
                  extensions={extensions}
                  selection={selection}
                  getRowId={getRowId}
                  getColumnPhase={getColumnPhase}
                  rowReorderEnabled
                  reorderDisabled={reorderDisabled}
                />
              </SortableContext>
            ) : (
              <TableBody
                type={type}
                columns={displayColumns}
                rows={rows}
                loadedRows={loadedRows}
                skeletonRows={skeletonRows}
                extensions={extensions}
                selection={selection}
                getRowId={getRowId}
                getColumnPhase={getColumnPhase}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (!rowReorderEnabled) return table;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveDragId(active.id)}
      onDragCancel={() => setActiveDragId(null)}
      onDragEnd={({ active, over }) => {
        setActiveDragId(null);
        if (!over || active.id === over.id || reorderDisabled) return;
        const nextIds = reorderRowIds(rowIds, String(active.id), String(over.id));
        if (!nextIds) return;
        rowReorder?.onReorder?.(nextIds);
      }}
    >
      {table}
      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: "0.4" } },
          }),
        }}
      >
        {activeDragRow ? (
          <div className="april-table__drag-overlay">
            <TableReorderHandle label={activeDragRow.name || "row"} />
            <span className="april-table__drag-overlay-label">{activeDragRow.name || "Row"}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
