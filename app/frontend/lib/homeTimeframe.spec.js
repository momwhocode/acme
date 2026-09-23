import { describe, expect, it } from "vitest"
import { formatIsoDate } from "./dateRangePicker.js"
import { homeTimeframeAsOf, resolveHomeTimeframeBounds } from "./homeTimeframe.js"

const ref = new Date(2026, 8, 23)

describe("resolveHomeTimeframeBounds", () => {
  it("uses the previous calendar month", () => {
    const bounds = resolveHomeTimeframeBounds({ preset: "last_month" }, ref)
    expect(formatIsoDate(bounds.from)).toBe("2026-08-01")
    expect(formatIsoDate(bounds.to)).toBe("2026-08-31")
  })

  it("uses the previous calendar quarter", () => {
    const bounds = resolveHomeTimeframeBounds({ preset: "last_quarter" }, ref)
    expect(formatIsoDate(bounds.from)).toBe("2026-04-01")
    expect(formatIsoDate(bounds.to)).toBe("2026-06-30")
  })

  it("uses the previous calendar year", () => {
    const bounds = resolveHomeTimeframeBounds({ preset: "last_year" }, ref)
    expect(formatIsoDate(bounds.from)).toBe("2025-01-01")
    expect(formatIsoDate(bounds.to)).toBe("2025-12-31")
  })
})

describe("homeTimeframeAsOf", () => {
  it("snapshots lifetime as the reference day", () => {
    expect(homeTimeframeAsOf({ preset: "lifetime" }, ref)).toBe("2026-09-23")
  })

  it("snapshots last month as the month end", () => {
    expect(homeTimeframeAsOf({ preset: "last_month" }, ref)).toBe("2026-08-31")
  })

  it("uses the custom end date", () => {
    expect(homeTimeframeAsOf({ preset: "custom", from: "2026-01-10", to: "2026-01-16" }, ref)).toBe("2026-01-16")
  })
})
