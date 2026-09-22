import { useMemo, useState } from "react";
import "../../styles/april/calendar.css";
import {
  addMonths,
  buildMonthCells,
  monthTitle,
  parseIsoDate,
  resolveInitialViewMonth,
  resolveRangeSelection,
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

function CalendarMonthPanel({ monthDate, from, to, hoverDate, idPrefix, onDaySelect, onDayHover }) {
  const cells = useMemo(
    () => buildMonthCells(monthDate, { from, to, hoverDate }),
    [monthDate, from, to, hoverDate]
  );

  return (
    <section className="april-calendar-popover__panel april-calendar-popover__panel--range">
      <CalendarWeekdays />
      <div className="april-calendar-popover__dates" role="grid">
        {cells.map((cell, index) =>
          cell ? (
            <BaseCalendarDate
              key={`${idPrefix}-${cell.label}`}
              label={cell.label}
              state={cell.state}
              id={`${idPrefix}-${cell.label}`}
              aria-label={cell.ariaLabel}
              onClick={() => onDaySelect?.(cell.date)}
              onMouseEnter={() => onDayHover?.(cell.date)}
            />
          ) : (
            <BaseCalendarDate key={`${idPrefix}-empty-${index}`} empty />
          )
        )}
      </div>
    </section>
  );
}

/** Interactive two-month range calendar. */
export function DateRangePicker({
  id = "date-range-picker",
  from = "",
  to = "",
  onChange,
  onDone,
  onReset,
  className = "",
}) {
  const parsedFrom = parseIsoDate(from);
  const parsedTo = parseIsoDate(to);
  const [viewMonth, setViewMonth] = useState(() => resolveInitialViewMonth(from, to));
  const [hoverDate, setHoverDate] = useState(null);
  const nextMonth = addMonths(viewMonth, 1);

  const handleDaySelect = (date) => {
    onChange?.(resolveRangeSelection(from, to, date));
  };

  const handleReset = () => {
    setHoverDate(null);
    onReset?.();
  };

  return (
    <div
      className={["april-calendar-popover", "april-calendar-popover--range", className]
        .filter(Boolean)
        .join(" ")}
      id={id}
      role="application"
      aria-label="Date range calendar"
      onMouseLeave={() => setHoverDate(null)}
    >
      <header className="april-calendar-popover__header april-calendar-popover__header--range">
        <div className="april-calendar-popover__range-titles">
          {[viewMonth, nextMonth].map((monthDate) => (
            <div key={monthDate.toISOString()} className="april-calendar-popover__range-title">
              <span className="april-calendar-popover__range-title-text">{monthTitle(monthDate)}</span>
            </div>
          ))}
        </div>
        <div className="april-calendar-popover__nav april-calendar-popover__nav--range">
          <IconButton
            variant="ghost"
            size="xs"
            icon="chevron_left"
            ariaLabel="Previous month"
            onClick={() => setViewMonth((current) => addMonths(current, -1))}
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

      <div className="april-calendar-popover__panels">
        <CalendarMonthPanel
          monthDate={viewMonth}
          from={parsedFrom}
          to={parsedTo}
          hoverDate={hoverDate}
          idPrefix={`${id}-left`}
          onDaySelect={handleDaySelect}
          onDayHover={setHoverDate}
        />
        <CalendarMonthPanel
          monthDate={nextMonth}
          from={parsedFrom}
          to={parsedTo}
          hoverDate={hoverDate}
          idPrefix={`${id}-right`}
          onDaySelect={handleDaySelect}
          onDayHover={setHoverDate}
        />
      </div>

      <footer className="april-calendar-popover__footer">
        <Button
          label="Reset All"
          variant="link"
          size="sm"
          leadingIcon={false}
          trailingIcon={false}
          onClick={handleReset}
        />
        <div className="april-calendar-popover__footer-actions">
          <Button
            label="Done"
            variant="primary"
            size="sm"
            leadingIcon={false}
            trailingIcon={false}
            onClick={onDone}
          />
        </div>
      </footer>
    </div>
  );
}
