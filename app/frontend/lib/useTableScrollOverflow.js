import { useLayoutEffect } from "react";

const SCROLL_OVERFLOW_CLASS = "april-table-shell__scroll--overflow";
const TABLE_OVERFLOW_CLASS = "april-table--overflow";

function measureElementContentWidth(el) {
  if (!el) return 0;
  const { width, minWidth, maxWidth } = el.style;
  el.style.width = "max-content";
  el.style.minWidth = "max-content";
  el.style.maxWidth = "none";
  const measured = Math.ceil(el.getBoundingClientRect().width);
  el.style.width = width;
  el.style.minWidth = minWidth;
  el.style.maxWidth = maxWidth;
  return measured;
}

function measureTableIntrinsicWidth(tableEl) {
  const { width, minWidth, tableLayout } = tableEl.style;
  tableEl.style.tableLayout = "auto";
  tableEl.style.width = "max-content";
  tableEl.style.minWidth = "max-content";
  const intrinsicWidth = tableEl.getBoundingClientRect().width;
  tableEl.style.tableLayout = tableLayout;
  tableEl.style.width = width;
  tableEl.style.minWidth = minWidth;
  return intrinsicWidth;
}

function clearColumnWidths(tableEl) {
  tableEl.querySelectorAll("colgroup col").forEach((col) => {
    col.style.width = "";
    col.style.minWidth = "";
    col.style.maxWidth = "";
  });
}

function isGrowableCol(col) {
  if (col.classList.contains("april-table__col--select")) return false;
  if (col.classList.contains("april-table__col--actions")) return false;
  return true;
}

/**
 * Pin select/actions to content width; distribute leftover frame width across
 * lead + data columns so hiding columns does not leave a hollow gap.
 */
function measureColumnContentWidth(tableEl, index) {
  const header = tableEl.querySelectorAll("thead th")[index];
  const bodyCells = tableEl.querySelectorAll(`tbody tr td:nth-child(${index + 1})`);
  let width = header ? measureElementContentWidth(header) : 0;
  const sampleCount = Math.min(bodyCells.length, 8);
  for (let i = 0; i < sampleCount; i += 1) {
    width = Math.max(width, measureElementContentWidth(bodyCells[i]));
  }
  return width;
}

function applyFixedColumnWidths(tableEl, scrollEl) {
  const cols = [...tableEl.querySelectorAll("colgroup col")];
  const availableWidth = scrollEl.clientWidth;

  const previousLayout = tableEl.style.tableLayout;
  const previousWidth = tableEl.style.width;
  tableEl.style.tableLayout = "auto";
  tableEl.style.width = "max-content";

  const contentWidths = cols.map((_, index) => measureColumnContentWidth(tableEl, index));

  tableEl.style.tableLayout = previousLayout;
  tableEl.style.width = previousWidth;

  const contentTotal = contentWidths.reduce((sum, width) => sum + width, 0);
  const extra = Math.max(availableWidth - contentTotal, 0);
  const growableIndexes = cols
    .map((col, index) => (isGrowableCol(col) ? index : -1))
    .filter((index) => index >= 0);
  const growableContentTotal = growableIndexes.reduce((sum, index) => sum + contentWidths[index], 0);

  cols.forEach((col, index) => {
    const contentWidth = contentWidths[index];
    if (!growableIndexes.includes(index) || extra === 0 || growableContentTotal === 0) {
      col.style.width = `${contentWidth}px`;
      col.style.minWidth = `${contentWidth}px`;
      col.style.maxWidth = `${contentWidth}px`;
      return;
    }

    const share = (contentWidth / growableContentTotal) * extra;
    const width = Math.floor(contentWidth + share);
    col.style.width = `${width}px`;
    col.style.minWidth = `${width}px`;
    col.style.maxWidth = `${width}px`;
  });

  // Absorb rounding remainder into the lead/flex column so widths sum to the frame.
  const assigned = cols.reduce((sum, col) => sum + (parseFloat(col.style.width) || 0), 0);
  const remainder = availableWidth - assigned;
  const flexIndex = cols.findIndex((col) => col.classList.contains("april-table__col--flex"));
  const absorbIndex = flexIndex >= 0 ? flexIndex : growableIndexes[growableIndexes.length - 1];
  if (absorbIndex >= 0 && remainder !== 0) {
    const next = Math.max(0, (parseFloat(cols[absorbIndex].style.width) || 0) + remainder);
    cols[absorbIndex].style.width = `${next}px`;
    cols[absorbIndex].style.minWidth = `${next}px`;
    cols[absorbIndex].style.maxWidth = `${next}px`;
  }

  const leadWidth = flexIndex >= 0 ? parseFloat(cols[flexIndex].style.width) || contentWidths[flexIndex] : 0;
  if (leadWidth > 0) {
    scrollEl.style.setProperty("--april-table-lead-flex-width", `${leadWidth}px`);
  } else {
    scrollEl.style.removeProperty("--april-table-lead-flex-width");
  }
}

function setOverflowClasses(tableEl, scrollEl, overflows) {
  tableEl.classList.toggle(TABLE_OVERFLOW_CLASS, overflows);
  scrollEl.classList.toggle(SCROLL_OVERFLOW_CLASS, overflows);
}

/** Enable horizontal scroll only when table columns exceed the scroll frame width. */
export function useTableScrollOverflow(scrollRef, layoutKey = "", pause = false) {
  useLayoutEffect(() => {
    if (pause) return undefined;

    const scrollEl = scrollRef.current;
    if (!scrollEl) return undefined;

    const tableEl = scrollEl.querySelector(".april-table");
    if (!tableEl) return undefined;

    const updateOverflow = () => {
      clearColumnWidths(tableEl);
      scrollEl.style.removeProperty("--april-table-lead-flex-width");

      const intrinsicWidth = measureTableIntrinsicWidth(tableEl);
      const availableWidth = scrollEl.clientWidth;
      const overflows = intrinsicWidth > availableWidth + 1;

      setOverflowClasses(tableEl, scrollEl, overflows);
      if (!overflows) {
        applyFixedColumnWidths(tableEl, scrollEl);
      }
    };

    updateOverflow();

    // ResizeObserver already fires before paint — avoid rAF so widths do not flash for a frame.
    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(scrollEl);
    resizeObserver.observe(tableEl);

    return () => resizeObserver.disconnect();
  }, [layoutKey, pause, scrollRef]);
}
