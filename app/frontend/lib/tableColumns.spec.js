import { describe, expect, it } from "vitest"
import {
  applyColumnVisibilityToggle,
  areAllColumnsVisible,
  defaultVisibleColumnIds,
  filterTableColumns,
  toggleableColumns,
  toggleColumnVisibility
} from "./tableColumns.js"

const columns = [
  { id: "select", kind: "select" },
  { id: "lead", kind: "lead", label: "Employee" },
  { id: "email", kind: "header", label: "Email" },
  { id: "country", kind: "header", label: "Country" },
  { id: "actions", kind: "actions" }
]

describe("tableColumns", () => {
  it("exposes only labeled toggleable columns", () => {
    expect(toggleableColumns(columns)).toEqual([
      { id: "email", label: "Email" },
      { id: "country", label: "Country" }
    ])
    expect(defaultVisibleColumnIds(columns)).toEqual([ "email", "country" ])
  })

  it("keeps lead, select, and actions visible when filtering", () => {
    expect(filterTableColumns(columns, [ "email" ]).map((column) => column.id)).toEqual([
      "select",
      "lead",
      "email",
      "actions"
    ])
  })

  it("toggles a column and refuses to hide the last one", () => {
    expect(toggleColumnVisibility([ "email", "country" ], "email")).toEqual([ "country" ])
    expect(toggleColumnVisibility([ "country" ], "country")).toEqual([ "country" ])
    expect(toggleColumnVisibility([ "email" ], "country")).toEqual([ "email", "country" ])
  })

  it("selects or clears all from the All option", () => {
    expect(areAllColumnsVisible([ "email", "country" ], [ "email", "country" ])).toBe(true)
    expect(applyColumnVisibilityToggle([ "email" ], "all", [ "email", "country" ])).toEqual([
      "email",
      "country"
    ])
    expect(applyColumnVisibilityToggle([ "email", "country" ], "all", [ "email", "country" ])).toEqual([])
  })
})
