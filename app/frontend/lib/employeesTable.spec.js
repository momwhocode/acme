import { describe, expect, it } from "vitest"
import {
  directoryQueryFromFilters,
  employeeTableRow,
  formatUsd,
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
      pay: "$100,000"
    })
  })

  it("formats missing USD as an em dash", () => {
    expect(formatUsd(null)).toBe("—")
    expect(titleCase("full-time")).toBe("Full Time")
  })
})
