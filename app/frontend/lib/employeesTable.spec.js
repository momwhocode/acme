import { describe, expect, it, vi } from "vitest"
import {
  countryFlag,
  countryLabel,
  directoryQueryFromFilters,
  employeeRowMenuItems,
  employeeTableRow,
  formatUsd,
  selectedEmployeesCsv,
  titleCase
} from "./employeesTable.js"

describe("employeesTable", () => {
  it("builds directory query params from chips and search", () => {
    expect(
      directoryQueryFromFilters({
        filterValues: { status: [ "active" ], country: [ "GB", "US" ], type: [], department: [] },
        q: " ada ",
        page: 2,
        perPage: 25
      })
    ).toEqual({
      page: 2,
      per_page: 25,
      q: "ada",
      status: "active",
      country: "GB,US"
    })
  })

  it("maps an employee to a table row", () => {
    const row = employeeTableRow({
      id: "1",
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@acme.test",
      department: "engineering",
      country: "GB",
      employment_type: "full-time",
      status: "active",
      level: "IC2",
      started_on: "2024-01-01",
      current_compensation: { annualised_usd: "100000.0" }
    })

    expect(row).toMatchObject({
      id: "1",
      name: "Ada Lovelace",
      department: "Engineering",
      status: "Active",
      pay: "$100,000",
      initials: "AL"
    })
    expect(row.color).toBeTruthy()
  })

  it("builds a row overflow menu", () => {
    const row = employeeTableRow({
      id: "1",
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@acme.test",
      department: "engineering",
      country: "GB",
      employment_type: "full-time",
      status: "active",
      started_on: "2024-01-01"
    })
    const onDetails = vi.fn()
    const onOffboard = vi.fn()
    const items = employeeRowMenuItems(row, { onDetails, onOffboard })

    expect(items.map((item) => item.label)).toEqual([ "View profile", "Mark as left" ])
    items[0].onClick()
    items[1].onClick()
    expect(onDetails).toHaveBeenCalledWith(row)
    expect(onOffboard).toHaveBeenCalledWith(row)
  })

  it("exports selected rows as csv", () => {
    expect(selectedEmployeesCsv([ { name: "Ada Lovelace", email: "ada@acme.test" } ])).toContain("Ada Lovelace")
  })

  it("turns a country code into a flag and name", () => {
    expect(countryFlag("GB")).toBe("🇬🇧")
    expect(countryLabel("GB")).toBe("United Kingdom")
    expect(countryFlag("not-a-country")).toBe("")
  })

  it("formats missing USD as an em dash", () => {
    expect(formatUsd(null)).toBe("—")
    expect(titleCase("full-time")).toBe("Full Time")
  })
})
