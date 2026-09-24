/** Home snapshot picker. as_of is the snapshot date; compare is the previous month end. */

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

function samePeriod(left, right) {
  return left?.toDate === right?.toDate && left?.year === right?.year && left?.month === right?.month
}

function shiftMonth(referenceDate, offset) {
  const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + offset, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
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

/** Last closed month, last quarter-end, last year-end. */
export function homePeriodPresets(referenceDate = new Date()) {
  const lastMonth = shiftMonth(referenceDate, -1)
  const lastQuarterEnd = new Date(referenceDate.getFullYear(), Math.floor(referenceDate.getMonth() / 3) * 3, 0)
  return [
    { id: "last-month", label: "Last Month", period: { toDate: false, ...lastMonth } },
    {
      id: "last-quarter",
      label: "Last Quarter",
      period: { toDate: false, year: lastQuarterEnd.getFullYear(), month: lastQuarterEnd.getMonth() }
    },
    {
      id: "last-year",
      label: "Last Year",
      period: { toDate: false, year: referenceDate.getFullYear() - 1, month: 11 }
    }
  ]
}

export function homePeriodControlLabel(value, referenceDate = new Date()) {
  const current = {
    toDate: value?.toDate !== false,
    year: value?.year ?? referenceDate.getFullYear(),
    month: value?.month ?? referenceDate.getMonth()
  }
  const preset = homePeriodPresets(referenceDate).find((item) => samePeriod(item.period, current))
  return preset?.label || homePeriodLabel(current, referenceDate)
}

/** Current month plus recent closed months. */
export function homeMonthOptions(referenceDate = new Date(), count = 7) {
  const options = []
  for (let index = 0; index < count; index += 1) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - index, 1)
    options.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      current: index === 0,
      label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    })
  }
  return options
}
