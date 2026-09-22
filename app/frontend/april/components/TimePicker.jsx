import { useMemo } from "react";
import "../../styles/april/calendar.css";
import { parseTimeValue, toTimeValue } from "../../lib/timeFormat.js";

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const BASE_MINUTES = [0, 15, 30, 45];
const PERIODS = ["AM", "PM"];

function pad2(value) {
  return String(value).padStart(2, "0");
}

function TimeCell({ label, ariaLabel, active, onClick }) {
  return (
    <button
      type="button"
      role="option"
      aria-label={ariaLabel}
      aria-selected={active}
      className={[
        "april-calendar-popover__period",
        "april-time-picker__cell",
        active ? "april-calendar-popover__period--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/** Interactive time popover for form time fields. Controlled value is `HH:mm`. */
export function TimePicker({ id = "time-picker", value = "", onChange, onClose, className = "" }) {
  const selected = parseTimeValue(value) || { hours12: 8, minutes: 0, period: "AM" };
  const minuteOptions = useMemo(() => {
    if (BASE_MINUTES.includes(selected.minutes)) return BASE_MINUTES;
    return [...BASE_MINUTES, selected.minutes].sort((a, b) => a - b);
  }, [selected.minutes]);

  const emit = (hours12, minutes, period, { close = false } = {}) => {
    onChange?.({ target: { value: toTimeValue(hours12, minutes, period) } });
    if (close) onClose?.();
  };

  return (
    <div
      className={[
        "april-time-picker",
        "april-calendar-popover",
        "april-calendar-popover--single-date",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      id={id}
      role="dialog"
      aria-label="Choose time"
    >
      <header className="april-calendar-popover__header april-time-picker__header">
        <div className="april-time-picker__period" role="group" aria-label="AM or PM">
          {PERIODS.map((period) => {
            const active = selected.period === period;
            return (
              <button
                key={period}
                type="button"
                role="option"
                aria-label={period}
                aria-selected={active}
                className={[
                  "april-time-picker__period-btn",
                  active ? "april-time-picker__period-btn--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => emit(selected.hours12, selected.minutes, period)}
              >
                {period}
              </button>
            );
          })}
        </div>
      </header>

      <div className="april-time-picker__section">
        <div className="april-time-picker__section-label" id={`${id}-hour-label`}>
          Hour
        </div>
        <div
          className="april-calendar-popover__periods april-time-picker__grid"
          role="listbox"
          aria-labelledby={`${id}-hour-label`}
        >
          {HOURS.map((hour) => (
            <TimeCell
              key={hour}
              label={pad2(hour)}
              ariaLabel={`Hour ${pad2(hour)}`}
              active={selected.hours12 === hour}
              onClick={() => emit(hour, selected.minutes, selected.period)}
            />
          ))}
        </div>
      </div>

      <div className="april-time-picker__section">
        <div className="april-time-picker__section-label" id={`${id}-minute-label`}>
          Minutes
        </div>
        <div
          className="april-calendar-popover__periods april-time-picker__grid april-time-picker__grid--minutes"
          role="listbox"
          aria-labelledby={`${id}-minute-label`}
        >
          {minuteOptions.map((minute) => (
            <TimeCell
              key={minute}
              label={`:${pad2(minute)}`}
              ariaLabel={`Minute ${pad2(minute)}`}
              active={selected.minutes === minute}
              onClick={() => emit(selected.hours12, minute, selected.period, { close: true })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
