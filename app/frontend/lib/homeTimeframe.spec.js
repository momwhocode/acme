import { describe, expect, it } from "vitest"
import {
  defaultHomePeriod,
  formatLongSnapshotDate,
  homeMonthOptions,
  homePeriodControlLabel,
  homePeriodPresets,
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
  it("names closed periods by preset and the live month by name", () => {
    expect(homePeriodControlLabel({ toDate: true, year: 2026, month: 8 }, ref)).toBe("September 2026")
    expect(homePeriodControlLabel({ toDate: false, year: 2026, month: 7 }, ref)).toBe("Last Month")
    expect(homePeriodControlLabel({ toDate: false, year: 2026, month: 5 }, ref)).toBe("Last Quarter")
    expect(homePeriodControlLabel({ toDate: false, year: 2025, month: 11 }, ref)).toBe("Last Year")
    expect(homePeriodControlLabel({ toDate: false, year: 2026, month: 4 }, ref)).toBe("May 2026")
    expect(formatLongSnapshotDate("2026-09-23")).toBe("23 September 2026")
  })

  it("lists the snapshot presets used on Home", () => {
    expect(homePeriodPresets(ref).map((preset) => [ preset.id, preset.label, preset.period ])).toEqual([
      [ "last-month", "Last Month", { toDate: false, year: 2026, month: 7 } ],
      [ "last-quarter", "Last Quarter", { toDate: false, year: 2026, month: 5 } ],
      [ "last-year", "Last Year", { toDate: false, year: 2025, month: 11 } ]
    ])
  })

  it("lists the current month and recent closed months", () => {
    expect(homeMonthOptions(ref, 3)).toEqual([
      { year: 2026, month: 8, current: true, label: "September 2026" },
      { year: 2026, month: 7, current: false, label: "August 2026" },
      { year: 2026, month: 6, current: false, label: "July 2026" }
    ])
  })
})
