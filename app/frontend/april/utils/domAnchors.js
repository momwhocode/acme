/** Prefer opening below; flip above when the viewport has more room upward. */
export function shouldOpenAbove(rect, estimatedHeight, gap = 4) {
  const spaceBelow = window.innerHeight - rect.bottom - gap;
  const spaceAbove = rect.top - gap;
  return spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
}

export function measureSelectPortalStyle(anchorEl, estimatedHeight = 280) {
  if (!anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  const gap = 4;
  const openAbove = shouldOpenAbove(rect, estimatedHeight, gap);
  // Use "auto" (not undefined) so stylesheet `top`/`bottom` rules cannot win.
  return {
    position: "fixed",
    top: openAbove ? "auto" : rect.bottom + gap,
    bottom: openAbove ? window.innerHeight - rect.top + gap : "auto",
    left: rect.left,
    width: rect.width,
    zIndex: 1200,
  };
}

export function measureDatePickerPortalStyle(anchorEl, estimatedHeight = 360) {
  if (!anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  const gap = 8;
  const openAbove = shouldOpenAbove(rect, estimatedHeight, gap);
  return {
    position: "fixed",
    top: openAbove ? "auto" : rect.bottom + gap,
    bottom: openAbove ? window.innerHeight - rect.top + gap : "auto",
    right: Math.max(8, window.innerWidth - rect.right),
    zIndex: 1200,
  };
}

/**
 * Fixed portal style for icon/button/filter menus.
 * Uses top/bottom "auto" so stylesheet `top` rules cannot pin the menu below the trigger.
 */
export function measureAnchoredPortalStyle(
  anchorEl,
  {
    estimatedHeight = 280,
    estimatedWidth,
    gap = 4,
    align = "start",
    minWidth = 200,
    width,
    preferAbove = false,
  } = {}
) {
  if (!anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  const openAbove = preferAbove || shouldOpenAbove(rect, estimatedHeight, gap);
  const fallbackMinWidth = minWidth ?? 200;
  const resolvedWidth = width ?? estimatedWidth ?? Math.max(fallbackMinWidth, rect.width);
  const left =
    align === "end"
      ? Math.min(Math.max(8, rect.right - resolvedWidth), Math.max(8, window.innerWidth - resolvedWidth - 8))
      : Math.min(rect.left, Math.max(8, window.innerWidth - resolvedWidth - 8));

  return {
    position: "fixed",
    top: openAbove ? "auto" : rect.bottom + gap,
    bottom: openAbove ? window.innerHeight - rect.top + gap : "auto",
    left,
    ...(width == null ? {} : { width }),
    ...(minWidth == null && width == null ? {} : { minWidth: width ?? minWidth }),
    zIndex: 1200,
  };
}
