import { describe, expect, it } from "vitest"
import { formatDisplayTime, parseTimeValue, toTimeValue } from "./timeFormat.js"

describe("timeFormat", () => {
  it("parses 24h strings and rejects invalid values", () => {
    expect(parseTimeValue("09:05")).toEqual({ hours24: 9, hours12: 9, minutes: 5, period: "AM" })
    expect(parseTimeValue("00:00")).toMatchObject({ hours12: 12, period: "AM" })
    expect(parseTimeValue("25:00")).toBeNull()
  })

  it("formats April display times", () => {
    expect(formatDisplayTime("13:07")).toBe("01:07 PM")
    expect(formatDisplayTime("bad")).toBe("")
  })

  it("builds 24h values from 12h parts", () => {
    expect(toTimeValue(1, 7, "PM")).toBe("13:07")
    expect(toTimeValue(12, 0, "AM")).toBe("00:00")
    expect(toTimeValue(0, 0, "AM")).toBe("")
  })
})
