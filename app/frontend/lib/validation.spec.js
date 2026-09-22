import { describe, expect, it } from "vitest"
import { digitsOnlyPhone } from "./validation.js"

describe("digitsOnlyPhone", () => {
  it("keeps a 10-digit number", () => {
    expect(digitsOnlyPhone("9876543210")).toBe("9876543210")
  })

  it("strips a leading 91 country code", () => {
    expect(digitsOnlyPhone("+91 98765 43210")).toBe("9876543210")
  })
})
