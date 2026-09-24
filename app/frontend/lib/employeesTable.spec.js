import { describe, expect, it, vi } from "vitest"
import {
  EMPLOYEES_TABLE_COLUMNS,
  countryFlag,
  countryLabel,
  directoryQueryFromFilters,
  employeeRowMenuItems,
  employeesFilterChips,
  annualisedLocal,
  displayLevel,
  employeeTableRow,
  formatUsd,
  titleCase
} from "./employeesTable.js"

describe("employeesTable", () => {
  it("lets the directory sort job title", () => {
    expect(EMPLOYEES_TABLE_COLUMNS.find((column) => column.id === "job_title").sortable).toBe(true)
  })

  it("builds directory query params from chips and search", () => {
    expect(
      directoryQueryFromFilters({
        filterValues: { status: [ "active" ], country: [ "GB", "US" ], type: [], department: [], manager: [ "mgr-1" ], level: [ "L2" ] },
        q: " ada ",
        page: 2,
        perPage: 25,
        sort: { columnId: "pay", direction: "asc" }
      })
    ).toEqual({
      page: 2,
      per_page: 25,
      q: "ada",
      status: "active",
      country: "GB,US",
      manager: "mgr-1",
      level: "L2",
      sort: "pay",
      direction: "asc"
    })
  })

  it("maps an employee to a table row", () => {
    const row = employeeTableRow({
      id: "1",
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@acme.test",
      job_title: "Engineer",
      department: "engineering",
      country: "GB",
      employment_type: "full-time",
      status: "active",
      level: "IC2",
      started_on: "2024-01-01",
      left_on: null,
      current_compensation: { annualised_usd: "100000.0" }
    })

    expect(row).toMatchObject({
      id: "1",
      name: "Ada Lovelace",
      job_title: "Engineer",
      department: "Engineering",
      employment_type: "Full Time",
      status: "Active",
      level: "L2",
      pay: "$100,000",
      left_on: null,
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

    expect(items.map((item) => item.label)).toEqual([ "View profile", "Start Offboarding", "Delete" ])
    items[0].onClick()
    items[1].onClick()
    expect(onDetails).toHaveBeenCalledWith(row)
    expect(onOffboard).toHaveBeenCalledWith(row)
  })

  it("turns a country code into a flag and name", () => {
    expect(countryFlag("GB")).toBe("🇬🇧")
    expect(countryLabel("GB")).toBe("United Kingdom")
    expect(countryFlag("not-a-country")).toBe("")
    expect(employeesFilterChips({ countries: [ "GB" ] })[3].dropdownOptions).toEqual([
      { value: "GB", label: "United Kingdom" }
    ])
    expect(employeesFilterChips()[2]).toMatchObject({
      filterLabel: "Level",
      filterKey: "level",
      dropdownOptions: [
        { value: "L1", label: "L1" },
        { value: "L2", label: "L2" },
        { value: "L3", label: "L3" },
        { value: "L4", label: "L4" },
        { value: "L5+", label: "L5+" }
      ]
    })
  })

  it("formats missing USD as an em dash", () => {
    expect(formatUsd(null)).toBe("—")
    expect(titleCase("full-time")).toBe("Full Time")
    expect(displayLevel("IC2")).toBe("L2")
    expect(displayLevel("L4")).toBe("L4")
    expect(annualisedLocal({ base_amount: 90000, pay_period: "annual" })).toBe(90000)
    expect(annualisedLocal({ base_amount: 45, pay_period: "hourly", hours_per_week: 40 })).toBe(93600)
  })
})
