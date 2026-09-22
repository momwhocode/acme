import { useMemo, useState } from "react";
import "../../styles/april/calendar.css";
import {
  addMonths,
  buildMonthCells,
  formatIsoDate,
  isIsoDateBefore,
  monthTitle,
  parseIsoDate,
  resolveInitialViewMonth,
  startOfDay,
  WEEKDAYS,
} from "../../lib/dateRangePicker.js";
import { BaseCalendarDate } from "./BaseCalendarDate.jsx";
import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";

function CalendarWeekdays() {
  return (
    <div className="april-calendar-popover__weekdays" aria-hidden="true">
      {WEEKDAYS.map((day) => (
        <span key={day} className="april-calendar-popover__weekday">
          {day}
        </span>
      ))}
    </div>
  );
}

/** Interactive single-month calendar for form date fields. */
export function SingleDatePicker({
  id = "single-date-picker",
  value = "",
  onChange,
  onClose,
  className = "",
  /** ISO `YYYY-MM-DD` — days before this are disabled. */
  minDate = "",
}) {
  const selected = parseIsoDate(value);
  const min = parseIsoDate(minDate);
  const [viewMonth, setViewMonth] = useState(() => resolveInitialViewMonth(value, value));

  const cells = useMemo(() => {
    const selectedDay = selected ? startOfDay(selected) : null;
    return buildMonthCells(viewMonth, {
      from: selectedDay,
      to: selectedDay,
    }).map((cell) => {
      if (!cell) return null;
      const isDisabled = min && cell.date.getTime() < min.getTime();
      const isSelected = selectedDay && cell.date.getTime() === selectedDay.getTime();
      return {
        ...cell,
        state: isDisabled ? "disabled" : isSelected ? "active" : "default",
      };
    });
  }, [selected, viewMonth, min]);

  const selectDate = (date) => {
    const iso = formatIsoDate(date);
    if (minDate && isIsoDateBefore(iso, minDate)) return;
    onChange?.(iso);
    onClose?.();
  };

  return (
    <div
      className={["april-calendar-popover", "april-calendar-popover--single-date", className]
        .filter(Boolean)
        .join(" ")}
      id={id}
      role="dialog"
      aria-label="Choose date"
    >
      <header className="april-calendar-popover__header">
        <span className="april-calendar-popover__range-title-text">{monthTitle(viewMonth)}</span>
        <div className="april-calendar-popover__nav">
          <IconButton
            variant="ghost"
            size="xs"
            icon="chevron_left"
            ariaLabel="Previous month"
            onClick={() => setViewMonth((current) => addMonths(current, -1))}
          />
          <Button
            type="button"
            label="Today"
            variant="link"
            size="sm"
            leadingIcon={false}
            trailingIcon={false}
            onClick={() => {
              const today = startOfDay(new Date());
              if (min && today.getTime() < min.getTime()) return;
              setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              selectDate(today);
            }}
          />
          <IconButton
            variant="ghost"
            size="xs"
            icon="chevron_right"
            ariaLabel="Next month"
            onClick={() => setViewMonth((current) => addMonths(current, 1))}
          />
        </div>
      </header>

      <CalendarWeekdays />
      <div className="april-calendar-popover__dates" role="grid">
        {cells.map((cell, index) =>
          cell ? (
            <BaseCalendarDate
              key={`${id}-${cell.label}`}
              label={cell.label}
              state={cell.state}
              id={`${id}-${cell.label}`}
              aria-label={cell.ariaLabel}
              onClick={() => {
                if (cell.state === "disabled") return;
                selectDate(cell.date);
              }}
            />
          ) : (
            <BaseCalendarDate key={`${id}-empty-${index}`} empty />
          )
        )}
      </div>
    </div>
  );
}
