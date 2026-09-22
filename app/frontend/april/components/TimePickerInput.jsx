import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatDisplayTime } from "../../lib/timeFormat.js";
import { resolveAprilVisualState, useInteractionState } from "../hooks/useInteractionState.js";
import { measureDatePickerPortalStyle } from "../utils/domAnchors.js";
import { Spinner } from "./Spinner.jsx";
import { TimePicker } from "./TimePicker.jsx";

const ICON_SIZE = 20;
const SEMANTIC_STATES = ["default", "error", "disabled", "loading"];

/** Time picker input — same chrome as DatePickerInput. Controlled value is `HH:mm`. */
export function TimePickerInput({
  state = "default",
  value = "",
  onChange,
  label = "Input Label",
  requiredText = "*",
  showRequired = false,
  required = false,
  showLabel = true,
  placeholder = "hh:mm AM",
  description = "Help / Error Description.",
  showDescription = true,
  fullWidth = false,
  id: idProp,
  className = "",
  forceOpen = false,
}) {
  const uid = useId();
  const id = idProp || `time-picker-input-${uid}`;
  const rootRef = useRef(null);
  const controlRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState(null);
  const semanticState = SEMANTIC_STATES.includes(state) ? state : "default";
  const isLoading = semanticState === "loading";
  const disabled = semanticState === "disabled" || isLoading;
  const pickerOpen = forceOpen || (open && !disabled);
  const usePortal = pickerOpen && !forceOpen;
  const { interaction, mouseBind, focusBind } = useInteractionState();
  const visualState = pickerOpen ? "focused" : resolveAprilVisualState(semanticState, interaction);
  const displayValue = formatDisplayTime(value);
  const valueEntered = Boolean(displayValue);

  useLayoutEffect(() => {
    if (!usePortal || !controlRef.current) {
      setPortalStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      setPortalStyle(measureDatePickerPortalStyle(controlRef.current, 320));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [usePortal, pickerOpen]);

  useEffect(() => {
    if (!pickerOpen || forceOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      if (popoverRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [pickerOpen, forceOpen]);

  const classes = [
    "april-date-picker-input",
    "april-time-picker-input",
    "april-date-picker-input--md",
    visualState !== "default" ? `april-date-picker-input--${visualState}` : "",
    pickerOpen ? "april-date-picker-input--calendar-opened april-date-picker-input--open" : "",
    valueEntered ? "april-date-picker-input--entered" : "",
    fullWidth ? "april-date-picker-input--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const emitChange = (nextValue) => {
    onChange?.({ target: { value: nextValue } });
  };

  const toggleOpen = () => {
    if (disabled || forceOpen) return;
    setOpen((wasOpen) => !wasOpen);
  };

  const popover = pickerOpen ? (
    <div
      ref={popoverRef}
      className={[
        "april-date-picker-input__popover",
        usePortal ? "april-date-picker-input__popover--portal" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={portalStyle || undefined}
      onMouseDown={(event) => event.preventDefault()}
    >
      {forceOpen ? (
        <TimePicker id={`${id}-picker`} value={value} />
      ) : (
        <TimePicker
          id={`${id}-picker`}
          value={value}
          onChange={(event) => emitChange(event.target.value)}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={classes} id={id} {...mouseBind}>
      {showLabel ? (
        <div className="april-date-picker-input__label-row">
          <label className="april-date-picker-input__label" htmlFor={`${id}-field`}>
            {label}
            {showRequired || required ? (
              <span className="april-date-picker-input__required" aria-hidden="true">
                {requiredText}
              </span>
            ) : null}
          </label>
        </div>
      ) : null}
      <div className="april-date-picker-input__field-wrapper">
        <div className="april-date-picker-input__control" ref={controlRef}>
          <input
            className="april-date-picker-input__field"
            type="text"
            id={`${id}-field`}
            name={id}
            placeholder={valueEntered ? undefined : placeholder}
            value={displayValue}
            disabled={disabled}
            readOnly
            aria-busy={isLoading || undefined}
            aria-expanded={pickerOpen || undefined}
            aria-haspopup="dialog"
            aria-invalid={semanticState === "error" || undefined}
            aria-required={required || showRequired || undefined}
            aria-describedby={showDescription && description ? `${id}-desc` : undefined}
            autoComplete="off"
            onClick={toggleOpen}
            onFocus={focusBind.onFocus}
            onBlur={focusBind.onBlur}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleOpen();
              }
            }}
          />
          {isLoading ? (
            <span className="april-date-picker-input__spinner">
              <Spinner size={String(ICON_SIZE)} decorative />
            </span>
          ) : (
            <button
              type="button"
              className="april-date-picker-input__trigger"
              aria-label="Open time picker"
              disabled={disabled}
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={toggleOpen}
            >
              <span
                className="material-symbols-outlined april-icon"
                style={{ fontSize: `var(--icon-size-icon-${ICON_SIZE})` }}
                aria-hidden="true"
              >
                schedule
              </span>
            </button>
          )}
        </div>
        {usePortal ? (portalStyle ? createPortal(popover, document.body) : null) : popover}
      </div>
      {showDescription && description ? (
        <p className="april-date-picker-input__description" id={`${id}-desc`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
