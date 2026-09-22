import { BADGE_COLOURS, BADGE_TYPES } from "../renderers/badge.js";

const DEFAULT_LABELS = {
  dot: "",
  "single-digit": "3",
  "double-digit": "32",
  overflow: "32+",
};

export function Badge({
  type = "single-digit",
  colour = "gray-light",
  variant = null,
  label,
  className = "",
}) {
  const resolvedType = BADGE_TYPES.includes(type) ? type : "single-digit";
  const resolvedColour = variant || (BADGE_COLOURS.includes(colour) ? colour : "gray-light");
  const resolvedLabel = label ?? DEFAULT_LABELS[resolvedType] ?? "";

  return (
    <span
      className={["april-badge", `april-badge--${resolvedType}`, `april-badge--${resolvedColour}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      {resolvedLabel}
    </span>
  );
}

export { BADGE_COLOURS, BADGE_TYPES };
