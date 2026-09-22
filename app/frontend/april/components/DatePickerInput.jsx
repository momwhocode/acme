import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatDisplayDate, parseDisplayDate } from "../../lib/dateFormat.js";
import { isIsoDateBefore } from "../../lib/dateRangePicker.js";
import { resolveAprilVisualState, useInteractionState } from "../hooks/useInteractionState.js";
import { resolveDatePickerInputPlaygroundArgs } from "../renderers/date-picker-input.js";
import { measureDatePickerPortalStyle } from "../utils/domAnchors.js";
import { SingleDatePicker } from "./SingleDatePicker.jsx";
import { Spinner } from "./Spinner.jsx";

const ICON_SIZE = 20;
const SEMANTIC_STATES = ["default", "error", "disabled", "loading"];

/** Date picker input — Figma 39:6150. Controlled value is ISO `YYYY-MM-DD`. */
export function DatePickerInput({
  state = "default",
  value = "",
  onChange,
  label = "Input Label",
  requiredText = "*",
  showRequired = false,
  required = false,
  showLabel = true,
  placeholder = "MM/DD/YYYY",
  description = "Help / Error Description.",
  showDescription = true,
  fullWidth = false,
  id: idProp,
  className = "",
  /** ISO `YYYY-MM-DD` — days before this are disabled in the calendar. */
  minDate = "",
  /** Storybook / static demos — force calendar open without interaction. */
  forceOpen = false,
}) {
  const uid = useId();
  const id = idProp || `date-picker-input-${uid}`;
  const rootRef = useRef(null);
  const controlRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState(null);
  const [draft, setDraft] = useState(() => formatDisplayDate(value));
  const [focused, setFocused] = useState(false);
  const semanticState = SEMANTIC_STATES.includes(state) ? state : "default";
  const isLoading = semanticState === "loading";
  const disabled = semanticState === "disabled" || isLoading;
  const calendarOpen = forceOpen || (open && !disabled);
  const usePortal = calendarOpen && !forceOpen;
  const { interaction, mouseBind, focusBind } = useInteractionState();
  const visualState = calendarOpen ? "focused" : resolveAprilVisualState(semanticState, interaction);
  const valueEntered = Boolean(draft);

  useEffect(() => {
    if (focused) return;
    setDraft(formatDisplayDate(value));
    // Mirror parent value only — do not reset draft when focus ends after a typed commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `focused` is intentionally omitted
  }, [value]);

  useLayoutEffect(() => {
    if (!usePortal || !controlRef.current) {
      setPortalStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      setPortalStyle(measureDatePickerPortalStyle(controlRef.current));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [usePortal, calendarOpen]);

  useEffect(() => {
    if (!calendarOpen || forceOpen) return undefined;

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
  }, [calendarOpen, forceOpen]);

  const classes = [
    "april-date-picker-input",
    `april-date-picker-input--md`,
    visualState !== "default" ? `april-date-picker-input--${visualState}` : "",
    calendarOpen ? "april-date-picker-input--calendar-opened april-date-picker-input--open" : "",
    valueEntered ? "april-date-picker-input--entered" : "",
    fullWidth ? "april-date-picker-input--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const commitIso = (nextValue) => {
    if (nextValue && minDate && isIsoDateBefore(nextValue, minDate)) return false;
    setDraft(formatDisplayDate(nextValue));
    onChange?.({ target: { value: nextValue } });
    return true;
  };

  const openCalendar = () => {
    if (disabled || forceOpen) return;
    setOpen(true);
  };

  const toggleOpen = () => {
    if (disabled || forceOpen) return;
    setOpen((wasOpen) => !wasOpen);
  };

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      commitIso("");
      return;
    }
    const iso = parseDisplayDate(draft);
    if (iso) {
      if (!commitIso(iso)) setDraft(formatDisplayDate(value));
      return;
    }
    setDraft(formatDisplayDate(value));
  };

  const calendar = calendarOpen ? (
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
        <SingleDatePicker id={`${id}-calendar`} value={value} minDate={minDate} />
      ) : (
        <SingleDatePicker
          id={`${id}-calendar`}
          value={value}
          minDate={minDate}
          onChange={(iso) => {
            commitIso(iso);
          }}
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
        <div ref={controlRef} className="april-date-picker-input__control">
          <input
            className="april-date-picker-input__field"
            type="text"
            id={`${id}-field`}
            name={id}
            placeholder={valueEntered ? undefined : placeholder}
            value={draft}
            disabled={disabled}
            aria-busy={isLoading || undefined}
            aria-expanded={calendarOpen || undefined}
            aria-haspopup="dialog"
            aria-invalid={semanticState === "error" || undefined}
            aria-required={required || showRequired || undefined}
            aria-describedby={showDescription && description ? `${id}-desc` : undefined}
            autoComplete="off"
            inputMode="numeric"
            onChange={(event) => {
              const next = event.target.value;
              setDraft(next);
              const trimmed = next.trim();
              if (!trimmed) {
                onChange?.({ target: { value: "" } });
                return;
              }
              const iso = parseDisplayDate(next);
              if (!iso) return;
              if (minDate && isIsoDateBefore(iso, minDate)) return;
              onChange?.({ target: { value: iso } });
            }}
            onFocus={(event) => {
              setFocused(true);
              focusBind.onFocus(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              focusBind.onBlur(event);
              commitDraft();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitDraft();
                setOpen(false);
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                openCalendar();
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
              aria-label="Open calendar"
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
                calendar_today
              </span>
            </button>
          )}
        </div>
        {usePortal ? (portalStyle && calendar ? createPortal(calendar, document.body) : null) : calendar}
      </div>
      {showDescription && description ? (
        <p className="april-date-picker-input__description" id={`${id}-desc`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function DatePickerInputPlayground(args) {
  const props = resolveDatePickerInputPlaygroundArgs(args);
  const forceOpen = props.state === "calendar-opened";
  const [value, setValue] = useState(() => (props.valueEntered ? "2045-03-13" : ""));

  return (
    <div className="april-date-picker-input-playground">
      <div className="april-date-picker-input-playground__frame">
        <DatePickerInput
          {...props}
          value={value}
          forceOpen={forceOpen}
          state={forceOpen ? "default" : props.state}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
    </div>
  );
}
