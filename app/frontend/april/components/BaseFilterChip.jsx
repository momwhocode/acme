import { DEFAULT_BASE_FILTER_CHIP_LABEL, resolveFilterChipBadgeType } from "../renderers/base-filter-chip.js";
import { Badge } from "./Badge.jsx";

function hasDisplayableBadgeValue(badgeValue) {
  if (badgeValue == null || badgeValue === "") return false;

  const numeric = Number(badgeValue);
  if (!Number.isNaN(numeric)) return numeric > 0;

  return true;
}

/** Base filter chip — compose inside `.april-filter-chips-header` only (Figma base-filter-chips). */
export function BaseFilterChip({
  state = "default",
  active = false,
  overflown = false,
  filterLabel = DEFAULT_BASE_FILTER_CHIP_LABEL,
  badgeValue,
  id = "base-filter-chip",
  onClick,
  "aria-expanded": ariaExpanded,
  "aria-haspopup": ariaHaspopup,
}) {
  const showBadge = hasDisplayableBadgeValue(badgeValue);
  const stateAttr = state === "hover" ? "hover" : undefined;

  const classes = [
    "april-base-filter-chip",
    overflown ? "april-base-filter-chip--overflown" : "",
    active ? "april-base-filter-chip--active" : "",
    showBadge ? "april-base-filter-chip--has-badge" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event) => {
    onClick?.(event);
    event.currentTarget.blur();
  };

  const badge = showBadge ? (
    <span className="april-base-filter-chip__badge">
      <Badge type={resolveFilterChipBadgeType(badgeValue)} colour="gray-dark" label={String(badgeValue)} />
    </span>
  ) : null;

  return (
    <button
      type="button"
      className={classes}
      id={id}
      data-state={stateAttr}
      aria-label={overflown ? "Filter" : undefined}
      aria-pressed={!overflown ? active : undefined}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      onClick={handleClick}
    >
      {overflown ? (
        <span
          className="april-base-filter-chip__icon material-symbols-outlined april-icon"
          aria-hidden="true"
        >
          filter_list
        </span>
      ) : (
        <>
          <span className="april-base-filter-chip__label">{filterLabel}</span>
          {badge}
          <span
            className="april-base-filter-chip__chevron material-symbols-outlined april-icon"
            aria-hidden="true"
          >
            keyboard_arrow_down
          </span>
        </>
      )}
      {overflown ? badge : null}
    </button>
  );
}
