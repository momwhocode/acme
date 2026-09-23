import { describe, expect, it } from "vitest"
import { formatCount } from "./homeSummary.js"

describe("formatCount", () => {
  it("formats thousands", () => {
    expect(formatCount(10000)).toBe("10,000")
  })
})
