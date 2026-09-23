import { describe, expect, it } from "vitest"
import {
  dateFilterDisplayLabel,
  dateRangeFilterGroups,
  isDateRangeFilterActive
} from "./dateFilter.js"

describe("dateFilter", () => {
  it("treats lifetime as inactive", () => {
    expect(isDateRangeFilterActive({ preset: "lifetime" })).toBe(false)
    expect(isDateRangeFilterActive({ preset: "last_month" })).toBe(true)
  })

  it("marks the selected preset in the menu groups", () => {
    const [presets, custom] = dateRangeFilterGroups({ preset: "today" })
    expect(presets.items.find((item) => item.value === "today").selected).toBe(true)
    expect(custom.items[0].selected).toBe(false)
  })

  it("labels custom ranges and inactive chips", () => {
    expect(dateFilterDisplayLabel("Created", { preset: "lifetime" })).toBe("Created")
    expect(dateFilterDisplayLabel("Created", { preset: "last_week" })).toBe("Created: Last Week")
    expect(dateFilterDisplayLabel("Created", { preset: "custom", from: "2026-01-01", to: "2026-01-31" })).toContain(
      "Created:"
    )
  })
})
