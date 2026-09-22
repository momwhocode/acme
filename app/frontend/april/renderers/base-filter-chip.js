/** Base filter chip (Figma base-filter-chips) — subcomponent for filter-chips-header only. */

export const BASE_FILTER_CHIP_STATES = ["default", "hover"];

export const DEFAULT_BASE_FILTER_CHIP_LABEL = "Filter Label";

export const DEFAULT_BASE_FILTER_CHIP_BADGE_VALUE = "3";

export function resolveFilterChipBadgeType(badgeValue) {
  const count = Number(badgeValue);
  if (Number.isNaN(count)) return "single-digit";
  if (count >= 100) return "overflow";
  if (count >= 10) return "double-digit";
  return "single-digit";
}
