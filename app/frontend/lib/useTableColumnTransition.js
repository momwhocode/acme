import { useLayoutEffect, useRef, useState, useCallback } from "react";

export const TABLE_COLUMN_TRANSITION_MS = 220;

function columnIdsKey(columns) {
  return columns.map((column) => column.id).join("|");
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Smooth dissolve when columns are shown or hidden via the columns dropdown. */
export function useTableColumnTransition(columns, duration = TABLE_COLUMN_TRANSITION_MS) {
  const columnsKey = columnIdsKey(columns);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const [state, setState] = useState(() => ({
    displayColumns: columns,
    phases: {},
  }));
  const committedRef = useRef(columns);
  const timerRef = useRef(null);
  const rafRef = useRef(null);

  useLayoutEffect(() => {
    const prev = committedRef.current;
    const next = columnsRef.current;

    const clearTimers = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (columnIdsKey(prev) === columnIdsKey(next)) {
      committedRef.current = next;
      setState((current) => {
        if (
          Object.keys(current.phases).length === 0 &&
          columnIdsKey(current.displayColumns) === columnIdsKey(next)
        ) {
          return current.displayColumns === next ? current : { displayColumns: next, phases: {} };
        }
        return { displayColumns: next, phases: {} };
      });
      return undefined;
    }

    clearTimers();

    if (prefersReducedMotion()) {
      committedRef.current = next;
      setState({ displayColumns: next, phases: {} });
      return undefined;
    }

    const prevIds = new Set(prev.map((column) => column.id));
    const nextIds = new Set(next.map((column) => column.id));
    const exiting = prev.filter((column) => !nextIds.has(column.id));
    const entering = next.filter((column) => !prevIds.has(column.id));

    const finishEnter = () => {
      committedRef.current = next;
      const enterPhases = Object.fromEntries(entering.map((column) => [column.id, "entering"]));
      setState({ displayColumns: next, phases: enterPhases });
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setState({ displayColumns: next, phases: {} });
        });
      });
    };

    if (exiting.length > 0) {
      setState({ displayColumns: prev, phases: {} });
      rafRef.current = requestAnimationFrame(() => {
        const exitPhases = Object.fromEntries(exiting.map((column) => [column.id, "exiting"]));
        setState({ displayColumns: prev, phases: exitPhases });
        timerRef.current = setTimeout(() => {
          if (entering.length > 0) {
            finishEnter();
          } else {
            committedRef.current = next;
            setState({ displayColumns: next, phases: {} });
          }
        }, duration);
      });
      return clearTimers;
    }

    if (entering.length > 0) {
      finishEnter();
      return clearTimers;
    }

    committedRef.current = next;
    setState({ displayColumns: next, phases: {} });
    return undefined;
  }, [columnsKey, duration]);

  const isAnimating = Object.keys(state.phases).length > 0;

  // When ids are unchanged (e.g. sort direction toggles), keep live column
  // metadata — state only freezes columns during show/hide animation.
  const displayColumns =
    !isAnimating && columnIdsKey(state.displayColumns) === columnsKey ? columns : state.displayColumns;

  const getColumnPhase = useCallback((id) => state.phases[id] ?? null, [state.phases]);

  return { displayColumns, getColumnPhase, isAnimating };
}
