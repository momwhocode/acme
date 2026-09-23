import { describe, expect, it } from "vitest"
import { t } from "./messages.js"

describe("t", () => {
  it("reads a catalog string", () => {
    expect(t("errors.unknownCountry")).toBe("unknown country")
    expect(t("success.employeeRehired")).toBe("Employee rehired")
  })

  it("interpolates Rails-style placeholders", () => {
    expect(t("success.imported", { count: 2, people: "employees" })).toBe("Imported 2 employees")
  })

  it("returns the path when the key is missing", () => {
    expect(t("errors.missingKey")).toBe("errors.missingKey")
  })
})
