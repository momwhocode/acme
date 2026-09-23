import { describe, expect, it } from "vitest"
import {
  countActiveFilters,
  filterSelectionBadgeCount,
  hasSelectedListingFilters,
  readFilterSelection,
  toggleFilterSelection,
  withAllFilterOption
} from "./filterValues.js"

const options = [ { value: "gb", label: "UK" }, { value: "us", label: "US" } ]

describe("filterValues", () => {
  it("normalizes selections and prepends All", () => {
    expect(readFilterSelection([ "gb", "all" ])).toEqual([ "gb" ])
    expect(readFilterSelection("all")).toEqual([])
    expect(withAllFilterOption(options)[0]).toEqual({ value: "all", label: "All" })
  })

  it("counts partial selections only", () => {
    expect(filterSelectionBadgeCount([ "gb" ], options)).toBe(1)
    expect(filterSelectionBadgeCount([ "gb", "us" ], options)).toBe(0)
  })

  it("toggles All and individual values", () => {
    expect(toggleFilterSelection([], "all", options)).toEqual([ "gb", "us" ])
    expect(toggleFilterSelection([ "gb", "us" ], "all", options)).toEqual([])
    expect(toggleFilterSelection([ "gb" ], "us", options)).toEqual([ "gb", "us" ])
  })

  it("counts chip filters including date presets", () => {
    expect(countActiveFilters([ "country" ], { country: [ "gb" ] })).toBe(1)
    expect(hasSelectedListingFilters({ country: [], started: { preset: "lifetime" } })).toBe(false)
    expect(hasSelectedListingFilters({ started: { preset: "last_month" } })).toBe(true)
  })
})
