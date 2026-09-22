const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseIsoDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

export function monthTitle(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function monthStartOffset(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

export function dayAriaLabel(date) {
  return `${date.getDate()}, ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function buildMonthCells(monthDate, { from, to, hoverDate } = {}) {
  const offset = monthStartOffset(monthDate);
  const days = daysInMonth(monthDate);
  const cells = [];

  for (let index = 0; index < offset; index += 1) cells.push(null);

  for (let day = 1; day <= days; day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    cells.push({
      date,
      label: String(day),
      state: resolveDayState(date, from, to, hoverDate),
      ariaLabel: dayAriaLabel(date),
    });
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function resolveDayState(date, from, to, hoverDate) {
  const time = startOfDay(date).getTime();
  const fromDate = from ? startOfDay(from) : null;
  const toDate = to ? startOfDay(to) : null;

  let rangeStart = fromDate;
  let rangeEnd = toDate;

  if (rangeStart && !rangeEnd && hoverDate) {
    rangeEnd = startOfDay(hoverDate);
  }

  if (!rangeStart) return "default";

  if (!rangeEnd) {
    return time === rangeStart.getTime() ? "range-start" : "default";
  }

  const min = Math.min(rangeStart.getTime(), rangeEnd.getTime());
  const max = Math.max(rangeStart.getTime(), rangeEnd.getTime());

  if (min === max && time === min) return "active";
  if (time === min) return "range-start";
  if (time === max) return "range-end";
  if (time > min && time < max) return "range";
  return "default";
}

export function resolveInitialViewMonth(from, to, referenceDate = new Date()) {
  const parsedFrom = parseIsoDate(from);
  const parsedTo = parseIsoDate(to);
  const anchor = parsedFrom || parsedTo || startOfDay(referenceDate);
  return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
}

export function resolveRangeSelection(currentFrom, currentTo, nextDate) {
  const fromDate = parseIsoDate(currentFrom);
  const toDate = parseIsoDate(currentTo);
  const picked = startOfDay(nextDate);

  if (!fromDate || toDate) {
    return { from: formatIsoDate(picked), to: "" };
  }

  if (picked.getTime() === fromDate.getTime()) {
    return { from: formatIsoDate(picked), to: formatIsoDate(picked) };
  }

  const min = picked < fromDate ? picked : fromDate;
  const max = picked < fromDate ? fromDate : picked;
  return { from: formatIsoDate(min), to: formatIsoDate(max) };
}

export function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** True when `isoValue` is a valid date strictly before `minIso` (both `YYYY-MM-DD`). */
export function isIsoDateBefore(isoValue, minIso) {
  const date = parseIsoDate(isoValue);
  const min = parseIsoDate(minIso);
  if (!date || !min) return false;
  return date.getTime() < min.getTime();
}

export { WEEKDAYS };
