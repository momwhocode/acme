import { describe, expect, it } from "vitest"
import {
  buildMonthCells,
  formatIsoDate,
  isIsoDateBefore,
  parseIsoDate,
  resolveDayState,
  resolveRangeSelection
} from "./dateRangePicker.js"

describe("dateRangePicker", () => {
  it("parses and formats ISO calendar dates", () => {
    expect(formatIsoDate(parseIsoDate("2026-09-23"))).toBe("2026-09-23")
    expect(parseIsoDate("not-a-date")).toBeNull()
    expect(isIsoDateBefore("2026-09-22", "2026-09-23")).toBe(true)
  })

  it("marks range ends and middle days", () => {
    const from = new Date(2026, 8, 1)
    const to = new Date(2026, 8, 5)
    expect(resolveDayState(new Date(2026, 8, 1), from, to)).toBe("range-start")
    expect(resolveDayState(new Date(2026, 8, 5), from, to)).toBe("range-end")
    expect(resolveDayState(new Date(2026, 8, 3), from, to)).toBe("range")
  })

  it("starts or completes a range from the next click", () => {
    expect(resolveRangeSelection("", "", new Date(2026, 8, 10))).toEqual({ from: "2026-09-10", to: "" })
    expect(resolveRangeSelection("2026-09-10", "", new Date(2026, 8, 12))).toEqual({
      from: "2026-09-10",
      to: "2026-09-12"
    })
  })

  it("pads a month grid to full weeks", () => {
    const cells = buildMonthCells(new Date(2026, 8, 1))
    expect(cells.length % 7).toBe(0)
    expect(cells.filter(Boolean).length).toBe(30)
  })
})
