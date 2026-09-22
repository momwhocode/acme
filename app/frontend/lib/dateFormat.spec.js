import { describe, expect, it } from "vitest"
import { formatDisplayDate, parseDisplayDate } from "./dateFormat.js"

describe("formatDisplayDate", () => {
  it("formats ISO as MM/DD/YYYY", () => {
    expect(formatDisplayDate("2026-09-22")).toBe("09/22/2026")
  })

  it("returns blank for an empty value", () => {
    expect(formatDisplayDate("")).toBe("")
  })
})

describe("parseDisplayDate", () => {
  it("parses MM/DD/YYYY to ISO", () => {
    expect(parseDisplayDate("09/22/2026")).toBe("2026-09-22")
  })

  it("accepts an ISO value", () => {
    expect(parseDisplayDate("2026-09-22")).toBe("2026-09-22")
  })

  it("rejects an impossible calendar date", () => {
    expect(parseDisplayDate("02/30/2026")).toBe("")
  })
})
