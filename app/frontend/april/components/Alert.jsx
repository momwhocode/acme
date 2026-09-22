import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";

const ALERT_ICONS = {
  gray: "info",
  green: "check_circle",
  blue: "info",
  yellow: "warning",
  red: "error",
};

const COLOR_ALIASES = {
  neutral: "gray",
  success: "green",
  info: "blue",
  warning: "yellow",
  danger: "red",
};

function resolveColor(color, variant) {
  const key = color || variant || "gray";
  return COLOR_ALIASES[key] || key;
}

/** Alert / toast — Figma feedback */
export function Alert({
  id,
  color = "green",
  variant = null,
  title = "Alert Title",
  description = "Alert description",
  message = null,
  toast = false,
  inline = false,
  showDescription = true,
  showButtons = true,
  showPrimaryButton = true,
  showSecondaryButton = true,
  primaryAction = "Button Label",
  secondaryAction = "Button Label",
  action = null,
  dismissible = true,
  onPrimaryAction,
  onSecondaryAction,
  onDismiss,
  className = "",
}) {
  const resolvedColor = resolveColor(color, variant);
  const resolvedDescription = description ?? message;
  const resolvedPrimary = action ?? primaryAction;

  const classes = [
    "april-alert",
    `april-alert--${resolvedColor}`,
    inline ? "april-alert--inline" : "",
    toast ? "april-alert--toast" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const actions =
    showButtons && (showPrimaryButton || showSecondaryButton) ? (
      <div className="april-alert__actions">
        {showPrimaryButton && resolvedPrimary ? (
          <Button
            label={resolvedPrimary}
            variant="link-neutral"
            size="md"
            leadingIcon={false}
            trailingIcon={false}
            onClick={onPrimaryAction}
          />
        ) : null}
        {showSecondaryButton && secondaryAction ? (
          <Button
            label={secondaryAction}
            variant="link-neutral"
            size="md"
            leadingIcon={false}
            trailingIcon={false}
            onClick={onSecondaryAction}
          />
        ) : null}
      </div>
    ) : null;

  const stackContent = (
    <>
      <h4 className="april-alert__title">{title}</h4>
      {showDescription && resolvedDescription ? (
        <p className="april-alert__description">{resolvedDescription}</p>
      ) : null}
      {!inline ? actions : null}
    </>
  );

  return (
    <div id={id} className={classes} role={toast ? "status" : "alert"}>
      <span className="april-alert__icon material-symbols-outlined april-icon" aria-hidden="true">
        {ALERT_ICONS[resolvedColor] || "info"}
      </span>
      <div className="april-alert__content">
        <div className={inline ? "april-alert__stack april-alert__stack--inline" : "april-alert__stack"}>
          {stackContent}
          {inline ? actions : null}
        </div>
      </div>
      {dismissible ? (
        <IconButton variant="link-neutral" size="md" icon="close" ariaLabel="Dismiss" onClick={onDismiss} />
      ) : null}
    </div>
  );
}
