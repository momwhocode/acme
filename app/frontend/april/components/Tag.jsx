function TagIcon({ name, className }) {
  return (
    <span className={className} aria-hidden="true">
      <span className="material-symbols-outlined april-icon" style={{ fontSize: 12 }}>
        {name}
      </span>
    </span>
  );
}

export function Tag({
  type = "default",
  variant = null,
  label = "Tag Label",
  leadingIcon = true,
  trailingIcon = true,
  leadingIconName = "add",
  trailingIconName = "add",
  onRemove,
  removeLabel,
  className = "",
}) {
  const resolvedType = variant || type;

  return (
    <span className={["april-tag", `april-tag--${resolvedType}`, className].filter(Boolean).join(" ")}>
      {leadingIcon ? <TagIcon name={leadingIconName} className="april-tag__icon" /> : null}
      <span className="april-tag__label">{label}</span>
      {trailingIcon ? (
        onRemove ? (
          <button
            type="button"
            className="april-tag__remove"
            onClick={onRemove}
            aria-label={removeLabel || `Remove ${label}`}
          >
            <TagIcon name={trailingIconName} className="april-tag__trailing-icon" />
          </button>
        ) : (
          <TagIcon name={trailingIconName} className="april-tag__trailing-icon" />
        )
      ) : null}
    </span>
  );
}

export { TAG_TYPES } from "../renderers/tag.js";
