import { CALENDAR_POPOVER_STATES } from "../renderers/calendar.js";
import "../../styles/april/calendar.css";
import { BaseCalendarDate } from "./BaseCalendarDate.jsx";
import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function CalendarLinkButton({ label, leadingIcon = false, trailingIcon = false }) {
  return (
    <Button
      label={label}
      variant="link"
      size="sm"
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      icon="chevron_left"
      trailingIconName="chevron_right"
    />
  );
}

function CalendarNavCluster() {
  return (
    <div className="april-calendar-popover__nav">
      <IconButton variant="ghost" size="xs" icon="chevron_left" ariaLabel="Previous month" />
      <CalendarLinkButton label="Today" />
      <IconButton variant="ghost" size="xs" icon="chevron_right" ariaLabel="Next month" />
    </div>
  );
}

function CalendarChevronNav({ modifier = "" }) {
  const navClass = modifier ? `april-calendar-popover__nav ${modifier}` : "april-calendar-popover__nav";
  return (
    <div className={navClass}>
      <IconButton variant="ghost" size="xs" icon="chevron_left" ariaLabel="Previous" />
      <IconButton variant="ghost" size="xs" icon="chevron_right" ariaLabel="Next" />
    </div>
  );
}

function CalendarPopoverHeader({ title, showToday = true }) {
  return (
    <header className="april-calendar-popover__header">
      <CalendarLinkButton label={title} />
      {showToday ? <CalendarNavCluster /> : <CalendarChevronNav />}
    </header>
  );
}

function CalendarRangeHeader({ titles = ["March 2045", "April 2045"] }) {
  return (
    <header className="april-calendar-popover__header april-calendar-popover__header--range">
      <div className="april-calendar-popover__range-titles">
        {titles.map((title) => (
          <div key={title} className="april-calendar-popover__range-title">
            <CalendarLinkButton label={title} />
          </div>
        ))}
      </div>
      <CalendarChevronNav modifier="april-calendar-popover__nav--range" />
    </header>
  );
}

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

function buildDateGrid({ startOffset, days, stateForDay = () => "default" }) {
  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= days; day += 1) cells.push({ label: String(day), state: stateForDay(day) });
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function CalendarDateGrid({ cells, idPrefix = "calendar-date" }) {
  return (
    <div className="april-calendar-popover__dates" role="grid">
      {cells.map((cell, index) =>
        cell ? (
          <BaseCalendarDate
            key={`${idPrefix}-${index}`}
            label={cell.label}
            state={cell.state}
            id={`${idPrefix}-${cell.label}`}
          />
        ) : (
          <BaseCalendarDate key={`${idPrefix}-empty-${index}`} empty />
        )
      )}
    </div>
  );
}

function CalendarRangePanel({ cells, idPrefix }) {
  return (
    <section className="april-calendar-popover__panel april-calendar-popover__panel--range">
      <CalendarWeekdays />
      <CalendarDateGrid cells={cells} idPrefix={idPrefix} />
    </section>
  );
}

function CalendarPeriodCell({ label, state = "default", id }) {
  return (
    <button
      type="button"
      className={`april-calendar-popover__period april-calendar-popover__period--${state}`}
      id={id}
      data-state={state === "hover" ? "hover" : undefined}
      aria-pressed={state === "active" || undefined}
    >
      {label}
    </button>
  );
}

function CalendarPeriodGrid({ items }) {
  return (
    <div className="april-calendar-popover__periods" role="grid">
      {items.map((item, index) => (
        <CalendarPeriodCell
          key={item.label}
          label={item.label}
          state={item.state}
          id={`calendar-period-${index}`}
        />
      ))}
    </div>
  );
}

function SingleDateCalendar() {
  const cells = buildDateGrid({
    startOffset: 6,
    days: 31,
    stateForDay: (day) => (day === 13 ? "active" : "default"),
  });
  return (
    <>
      <CalendarPopoverHeader title="March 2045" />
      <CalendarWeekdays />
      <CalendarDateGrid cells={cells} idPrefix="calendar-single-date" />
    </>
  );
}

function RangeCalendar() {
  const marchCells = buildDateGrid({
    startOffset: 6,
    days: 31,
    stateForDay: (day) => {
      if (day === 13) return "range-start";
      if (day >= 14 && day <= 19) return "range";
      if (day === 20) return "range-end";
      return "default";
    },
  });
  const aprilCells = buildDateGrid({ startOffset: 2, days: 30 });
  return (
    <>
      <CalendarRangeHeader />
      <div className="april-calendar-popover__panels">
        <CalendarRangePanel cells={marchCells} idPrefix="calendar-range-march" />
        <CalendarRangePanel cells={aprilCells} idPrefix="calendar-range-april" />
      </div>
      <footer className="april-calendar-popover__footer">
        <CalendarLinkButton label="Reset All" />
        <div className="april-calendar-popover__footer-actions">
          <Button label="Done" variant="primary" size="sm" leadingIcon={false} trailingIcon={false} />
        </div>
      </footer>
    </>
  );
}

function MonthCalendar() {
  const items = MONTHS.map((label) => ({
    label,
    state: label === "Mar" ? "active" : label === "Jun" ? "hover" : "default",
  }));
  return (
    <>
      <CalendarPopoverHeader title="2040" showToday={false} />
      <CalendarPeriodGrid items={items} />
    </>
  );
}

function YearCalendar() {
  const items = Array.from({ length: 10 }, (_, index) => {
    const year = 2040 + index;
    return { label: String(year), state: year === 2042 ? "active" : year === 2045 ? "hover" : "default" };
  });
  return (
    <>
      <CalendarPopoverHeader title="2040 - 2049" showToday={false} />
      <CalendarPeriodGrid items={items} />
    </>
  );
}

const RENDERERS = {
  "single-date": SingleDateCalendar,
  range: RangeCalendar,
  month: MonthCalendar,
  year: YearCalendar,
};

/** Calendar popover — Figma 456:3034 */
export function CalendarPopover({ state = "single-date", id = "calendar-popover", className = "" }) {
  const resolvedState = CALENDAR_POPOVER_STATES.includes(state) ? state : "single-date";
  const Content = RENDERERS[resolvedState] || SingleDateCalendar;

  return (
    <div
      className={["april-calendar-popover", `april-calendar-popover--${resolvedState}`, className]
        .filter(Boolean)
        .join(" ")}
      id={id}
      role="application"
      aria-label="Calendar"
    >
      <Content />
    </div>
  );
}
