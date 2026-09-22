import { describe, expect, it } from "vitest"
import { todayIso } from "./formDates.js"

describe("todayIso", () => {
  it("formats a local calendar date as YYYY-MM-DD", () => {
    expect(todayIso(new Date(2026, 8, 22))).toBe("2026-09-22")
  })
})
