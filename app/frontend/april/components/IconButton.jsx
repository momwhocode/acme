import { useInteractionState, blurOnMouseClick } from "../hooks/useInteractionState.js";
import { BUTTON_ICON_SIZE } from "../renderers/shared.js";
import { Spinner } from "./Spinner.jsx";

function IconGlyph({ name, size }) {
  return (
    <span
      className="material-symbols-outlined april-icon"
      style={{ fontSize: `var(--icon-size-icon-${size})` }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export function IconButton({
  variant = "primary",
  size = "md",
  icon = "add",
  ariaLabel,
  loading = false,
  disabled = false,
  onClick,
  className = "",
  href = null,
  type = "button",
  ...rest
}) {
  const { interaction, mouseBind, focusBind } = useInteractionState({ keyboardFocusOnly: true });
  const iconSize = BUTTON_ICON_SIZE[size] || 20;
  const isDisabled = disabled || loading;
  const resolvedAriaLabel = ariaLabel || String(icon || "Button");

  const classes = [
    "april-btn",
    "april-icon-btn",
    `april-btn--${variant}`,
    `april-icon-btn--${size}`,
    loading ? "april-btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = loading ? (
    <Spinner size={String(iconSize)} decorative />
  ) : (
    <IconGlyph name={icon} size={iconSize} />
  );

  const shared = {
    className: classes,
    "aria-label": resolvedAriaLabel,
    "aria-disabled": isDisabled || undefined,
    "aria-busy": loading || undefined,
    "data-state": !isDisabled && interaction ? interaction : undefined,
    ...mouseBind,
    ...focusBind,
    ...rest,
  };

  if (href) {
    return (
      <a href={href} {...shared}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} disabled={isDisabled} onClick={blurOnMouseClick(onClick)} {...shared}>
      {content}
    </button>
  );
}
