import { BASE_CALENDAR_DATE_STATES } from "../renderers/base-calendar-date.js";

const PRESSED_STATES = new Set(["active", "range-start", "range-end"]);

/** Base calendar date cell — compose inside calendar popover only */
export function BaseCalendarDate({
  state = "default",
  label = "1",
  empty = false,
  id = "base-calendar-date",
  className = "",
  "aria-label": ariaLabel,
  onClick,
  onMouseEnter,
}) {
  if (empty) {
    return <span className="april-base-calendar-date april-base-calendar-date--empty" aria-hidden="true" />;
  }

  const resolvedState = BASE_CALENDAR_DATE_STATES.includes(state) ? state : "default";
  const disabled = resolvedState === "disabled";
  const pressed = PRESSED_STATES.has(resolvedState);
  const stateAttr = resolvedState === "hover" ? "hover" : undefined;

  return (
    <button
      type="button"
      className={["april-base-calendar-date", `april-base-calendar-date--${resolvedState}`, className]
        .filter(Boolean)
        .join(" ")}
      id={id}
      data-state={stateAttr}
      disabled={disabled}
      aria-pressed={pressed || undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {label}
    </button>
  );
}

export function BaseCalendarDateGallery() {
  return (
    <div className="april-base-calendar-date-gallery">
      {BASE_CALENDAR_DATE_STATES.map((state, index) => (
        <div key={state} className="april-base-calendar-date-gallery__item">
          <span className="april-base-calendar-date-gallery__label">{state}</span>
          <BaseCalendarDate state={state} id={`base-calendar-date-gallery-${index}`} />
        </div>
      ))}
    </div>
  );
}
