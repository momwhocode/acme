const FORMAT_FIELD_TYPES = new Set(["tel", "email", "password", "number"]);

/** Copy fields start at 60. Identifier caps (phone, GSTIN, Aadhaar, subdomain) stay silent. */
export const CHARACTER_COUNT_MIN_LIMIT = 60;

/** Live `current / max` belongs on copy fields, not format-constrained identifiers. */
export function shouldShowCharacterCount(maxLength, type) {
  if (FORMAT_FIELD_TYPES.has(type)) return false;
  return Number(maxLength) >= CHARACTER_COUNT_MIN_LIMIT;
}

/** Live character count for fields that have a max length. */
export function formatCharacterCount(value, maxLength) {
  const current = String(value ?? "").length;
  const max = Number(maxLength);
  return `${current.toLocaleString("en-IN")} / ${max.toLocaleString("en-IN")}`;
}

export function CharacterCount({ value = "", maxLength, type, id, className = "" }) {
  if (!shouldShowCharacterCount(maxLength, type)) return null;

  return (
    <p id={id} className={["april-character-count", className].filter(Boolean).join(" ")} aria-live="polite">
      {formatCharacterCount(value, maxLength)}
    </p>
  );
}
