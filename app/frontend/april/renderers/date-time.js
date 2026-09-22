const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const SHORT_MONTH_LOOKUP = Object.fromEntries(
  SHORT_MONTH_NAMES.map((name, index) => [name.toLowerCase(), index])
);

/** Listing table datetime — e.g. `07 Apr-26 03:30 PM` */
const LISTING_DATETIME_RE = /^(\d{1,2})\s+([A-Za-z]{3})-(\d{2,4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i;

/** Listing date-only — e.g. `7 Apr-2026` */
const LISTING_DATE_RE = /^(\d{1,2})\s+([A-Za-z]{3})-(\d{4})$/;

const TABLE_DATE_ONLY_COLUMNS = new Set(["dateJoined", "invoiceDate", "taxPeriod"]);

const TABLE_DATETIME_COLUMNS = new Set(["createdOn", "lastActive", "dueDate", "paymentDate"]);

function isAlreadyFormattedListingDateTime(value) {
  return typeof value === "string" && LISTING_DATETIME_RE.test(value.trim());
}

function isAlreadyFormattedListingDate(value) {
  return typeof value === "string" && LISTING_DATE_RE.test(value.trim());
}

function toDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();
  if (!text) return null;

  if (isAlreadyFormattedListingDateTime(text)) {
    return parseListingDateTime(text);
  }

  if (isAlreadyFormattedListingDate(text)) {
    return parseListingDate(text);
  }

  if (!text.includes("T") && !/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseListingDate(text) {
  const match = text.trim().match(LISTING_DATE_RE);
  if (!match) return null;

  const month = SHORT_MONTH_LOOKUP[match[2].toLowerCase()];
  if (month == null) return null;

  const parsed = new Date(Number(match[3]), month, Number(match[1]));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseListingDateTime(text) {
  const match = String(text).trim().match(LISTING_DATETIME_RE);
  if (!match) return null;

  const month = SHORT_MONTH_LOOKUP[match[2].toLowerCase()];
  if (month == null) return null;

  const yearDigits = match[3];
  const year = yearDigits.length === 2 ? 2000 + Number(yearDigits) : Number(yearDigits);
  let hours = Number(match[4]);
  const minutes = Number(match[5]);
  const period = match[6].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const parsed = new Date(year, month, Number(match[1]), hours, minutes);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Listing datetime — e.g. `07 Apr-26 03:30 PM`. */
export function formatAprilDateTime(value) {
  if (value == null || value === "") return "—";
  if (isAlreadyFormattedListingDateTime(value)) return String(value).trim();

  const date = toDate(value);
  if (!date) {
    if (typeof value === "string" && !value.includes("T")) return value;
    return "—";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = SHORT_MONTH_NAMES[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";

  return `${day} ${month}-${year} ${String(hours12).padStart(2, "0")}:${minutes} ${period}`;
}

/** Listing date-only — e.g. `7 Apr-2026`. */
export function formatAprilShortDate(value) {
  if (value == null || value === "") return "—";
  if (isAlreadyFormattedListingDate(value)) return String(value).trim();
  if (typeof value === "string" && isAlreadyFormattedListingDateTime(value)) {
    return formatAprilShortDate(parseListingDateTime(value));
  }
  if (typeof value === "string" && !value.includes("T") && !/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value;
  }

  const date = toDate(value);
  if (!date) return "—";

  return `${date.getDate()} ${SHORT_MONTH_NAMES[date.getMonth()]}-${date.getFullYear()}`;
}

export function isTableDateColumn(columnId) {
  return TABLE_DATE_ONLY_COLUMNS.has(columnId) || TABLE_DATETIME_COLUMNS.has(columnId);
}

/** Table cell dates — datetime vs date-only based on column id. */
export function formatTableDateValue(columnId, value) {
  if (value == null || value === "") return "—";

  if (TABLE_DATE_ONLY_COLUMNS.has(columnId)) {
    return formatAprilShortDate(value);
  }

  if (columnId === "createdOn" || columnId === "lastActive") {
    const text = String(value).trim();
    if (text.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(text) || isAlreadyFormattedListingDateTime(text)) {
      return formatAprilDateTime(value);
    }
    return formatAprilShortDate(value);
  }

  if (TABLE_DATETIME_COLUMNS.has(columnId)) {
    return formatAprilDateTime(value);
  }

  return value ?? "—";
}
