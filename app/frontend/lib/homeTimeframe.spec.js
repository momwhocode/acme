import { describe, expect, it } from "vitest"
import {
  defaultHomePeriod,
  formatLongSnapshotDate,
  homeMonthOptions,
  homePeriodControlLabel,
  homePeriodLabel,
  homeTimeframeAsOf,
  homeTimeframeCompareAsOf
} from "./homeTimeframe.js"

const ref = new Date(2026, 8, 23)

describe("defaultHomePeriod", () => {
  it("defaults to the current month to date", () => {
    expect(defaultHomePeriod(ref)).toEqual({
      toDate: true,
      year: 2026,
      month: 8
    })
  })
})

describe("homeTimeframeAsOf", () => {
  it("uses today for the current month to date", () => {
    expect(homeTimeframeAsOf({ toDate: true, year: 2026, month: 8 }, ref)).toBe("2026-09-23")
  })

  it("uses month end for the current month when the full period is selected", () => {
    expect(homeTimeframeAsOf({ toDate: false, year: 2026, month: 8 }, ref)).toBe("2026-09-30")
  })

  it("uses month end for a completed past month", () => {
    expect(homeTimeframeAsOf({ toDate: false, year: 2026, month: 7 }, ref)).toBe("2026-08-31")
  })
})

describe("homeTimeframeCompareAsOf", () => {
  it("compares a month with the previous month end", () => {
    expect(homeTimeframeCompareAsOf({ toDate: true, year: 2026, month: 8 }, ref)).toBe("2026-08-31")
  })
})

describe("home period labels", () => {
  it("names the selected month", () => {
    expect(homePeriodLabel({ year: 2026, month: 8 }, ref)).toBe("September 2026")
    expect(homePeriodControlLabel({ toDate: true, year: 2026, month: 8 }, ref)).toBe("September 2026 · To Date")
    expect(homePeriodControlLabel({ toDate: false, year: 2026, month: 8 }, ref)).toBe("September 2026 · Full Period")
    expect(formatLongSnapshotDate("2026-09-23")).toBe("23 September 2026")
  })

  it("lists recent months for the picker", () => {
    expect(homeMonthOptions(ref, 3)).toEqual([
      { year: 2026, month: 8, label: "September 2026" },
      { year: 2026, month: 7, label: "August 2026" },
      { year: 2026, month: 6, label: "July 2026" }
    ])
  })
})
