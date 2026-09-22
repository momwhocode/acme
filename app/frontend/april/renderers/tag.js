export const TAG_TYPES = [
  "default",
  "primary",
  "success",
  "warning",
  "error",
  "info",
  "purple",
  "outlined",
  "ghost",
];

/** Soft colored variants for freeform labels (avoid white/gray default chips). */
export const FREEFORM_TAG_TYPES = ["info", "primary", "purple", "success", "warning"];

/** Stable colored tag type for a freeform label. */
export function tagTypeForLabel(label) {
  const text = String(label ?? "");
  if (!text) return FREEFORM_TAG_TYPES[0];
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return FREEFORM_TAG_TYPES[hash % FREEFORM_TAG_TYPES.length];
}
