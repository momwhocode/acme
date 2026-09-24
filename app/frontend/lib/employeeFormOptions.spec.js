import { describe, expect, it } from "vitest"
import {
  TYPE_SELECT_OPTIONS,
  countrySelectOptions,
  departmentSelectOptions,
  formLevelValue,
  levelSelectOptions
} from "./employeeFormOptions.js"

describe("formLevelValue", () => {
  it("maps seed IC/M codes onto the L1–L5+ pick list", () => {
    expect(formLevelValue("IC2")).toBe("L2")
    expect(formLevelValue("L4")).toBe("L4")
    expect(formLevelValue("M1")).toBe("L5+")
    expect(formLevelValue("")).toBe("")
  })
})

describe("select options", () => {
  it("keeps country, department, type, and level lists aligned with the forms", () => {
    expect(countrySelectOptions().map((option) => option.value)).toEqual([
      "US", "GB", "DE", "FR", "IE", "NL", "IN"
    ])
    expect(departmentSelectOptions().some((option) => option.value === "engineering")).toBe(true)
    expect(TYPE_SELECT_OPTIONS.map((option) => option.value)).toEqual([
      "full-time", "part-time", "contractor", "freelancer", "intern"
    ])
    expect(levelSelectOptions().map((option) => option.value)).toEqual([
      "L1", "L2", "L3", "L4", "L5+"
    ])
  })

  it("keeps an unknown current value visible so edit does not blank the field", () => {
    expect(countrySelectOptions("XX").at(-1)).toEqual({ value: "XX", label: "XX" })
    expect(departmentSelectOptions("labs").at(-1)).toEqual({ value: "labs", label: "Labs" })
    expect(levelSelectOptions("IC2").map((option) => option.value)).toEqual([
      "L1", "L2", "L3", "L4", "L5+"
    ])
  })
})
