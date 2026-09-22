import { useInteractionState, blurOnMouseClick } from "../hooks/useInteractionState.js";
import { BUTTON_ICON_SIZE } from "../renderers/shared.js";

export function buttonBusyLabel(label, loadingLabel) {
  if (loadingLabel) return loadingLabel;
  return /save/i.test(String(label ?? "")) ? "Saving changes" : String(label || "Working");
}

function BtnIcon({ name, size }) {
  return (
    <span
      className="april-btn__icon material-symbols-outlined april-icon"
      style={{ fontSize: `var(--icon-size-icon-${size})` }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export function Button({
  label = "Button Label",
  variant = "primary",
  size = "md",
  type = "button",
  leadingIcon = true,
  trailingIcon = true,
  icon = "add",
  trailingIconName = "add",
  loading = false,
  loadingLabel,
  disabled = false,
  onClick,
  className = "",
  fullWidth = false,
  state: stateProp = null,
  ...rest
}) {
  const { interaction, mouseBind, focusBind } = useInteractionState({ keyboardFocusOnly: true });
  const iconSize = BUTTON_ICON_SIZE[size] || 20;
  const isDisabled = disabled || loading;
  const displayLabel = loading ? buttonBusyLabel(label, loadingLabel) : label;
  const classes = [
    "april-btn",
    `april-btn--${variant}`,
    `april-btn--${size}`,
    loading ? "april-btn--loading" : "",
    fullWidth ? "april-btn--full-width" : "",
    stateProp === "active-pressed" ? "april-btn--active-pressed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={!isDisabled && interaction ? interaction : undefined}
      onClick={blurOnMouseClick(onClick)}
      {...mouseBind}
      {...focusBind}
      {...rest}
    >
      {leadingIcon && !loading ? <BtnIcon name={icon} size={iconSize} /> : null}
      <span className="april-btn__label">{displayLabel}</span>
      {trailingIcon && !loading ? <BtnIcon name={trailingIconName} size={iconSize} /> : null}
    </button>
  );
}
