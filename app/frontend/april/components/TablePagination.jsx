import { IconButton } from "./IconButton.jsx";

/** Table footer pagination — prev/next with record range */
export function TablePagination({ page = 1, totalPages = 1, totalCount = 0, perPage = 10, onPageChange }) {
  if (totalCount <= 0 || totalPages <= 1) return null;

  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const rangeStart = (safePage - 1) * perPage + 1;
  const rangeEnd = Math.min(safePage * perPage, totalCount);
  const canGoPrev = safePage > 1;
  const canGoNext = safePage < totalPages;

  return (
    <footer className="april-table-pagination" aria-label="Table pagination">
      <p className="april-table-pagination__summary april-text-style april-text-style--text-sm-regular">
        Showing {rangeStart}–{rangeEnd} of {totalCount}
      </p>
      <div className="april-table-pagination__controls">
        <IconButton
          variant="outlined"
          size="md"
          icon="chevron_left"
          ariaLabel="Previous page"
          disabled={!canGoPrev}
          onClick={() => onPageChange?.(safePage - 1)}
        />
        <span className="april-table-pagination__page april-text-style april-text-style--text-sm-regular">
          Page {safePage} of {totalPages}
        </span>
        <IconButton
          variant="outlined"
          size="md"
          icon="chevron_right"
          ariaLabel="Next page"
          disabled={!canGoNext}
          onClick={() => onPageChange?.(safePage + 1)}
        />
      </div>
    </footer>
  );
}
