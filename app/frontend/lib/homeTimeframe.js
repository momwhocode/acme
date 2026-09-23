/** Home month picker. as_of is the snapshot date; compare is the previous month end. */

import { formatIsoDate } from "./dateRangePicker.js"

export function defaultHomePeriod(referenceDate = new Date()) {
  return {
    toDate: true,
    year: referenceDate.getFullYear(),
    month: referenceDate.getMonth()
  }
}

function monthEnd(value, referenceDate) {
  const year = value?.year ?? referenceDate.getFullYear()
  const month = value?.month ?? referenceDate.getMonth()
  return new Date(year, month + 1, 0)
}

function isCurrentMonth(value, referenceDate) {
  const year = value?.year ?? referenceDate.getFullYear()
  const month = value?.month ?? referenceDate.getMonth()
  return year === referenceDate.getFullYear() && month === referenceDate.getMonth()
}

// Current month + To Date uses today so Home is live. Past months use that month's last day.
export function homeTimeframeAsOf(value, referenceDate = new Date()) {
  if (value?.toDate !== false && isCurrentMonth(value, referenceDate)) {
    return formatIsoDate(referenceDate)
  }
  return formatIsoDate(monthEnd(value, referenceDate))
}

// Compare snapshot is always the last day of the month before as_of.
export function homeTimeframeCompareAsOf(value, referenceDate = new Date()) {
  const asOf = homeTimeframeAsOf(value, referenceDate)
  const asOfDate = new Date(`${asOf}T00:00:00`)
  return formatIsoDate(new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 0))
}

function homePeriodLabel(value, referenceDate = new Date()) {
  const year = value?.year ?? referenceDate.getFullYear()
  const month = value?.month ?? referenceDate.getMonth()
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function homePeriodControlLabel(value, referenceDate = new Date()) {
  return `${homePeriodLabel(value, referenceDate)} · ${value?.toDate === false ? "Full Period" : "To Date"}`
}

export function formatLongSnapshotDate(iso) {
  if (!iso) return ""
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

export function homeMonthOptions(referenceDate = new Date(), count = 18) {
  const options = []
  for (let index = 0; index < count; index += 1) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - index, 1)
    options.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    })
  }
  return options
}
