import { describe, expect, it } from "vitest"
import { applySortToColumns, isSortableColumn, nextSortState } from "./tableSort.js"

describe("tableSort", () => {
  it("treats sortable flags and sortable-header kind as sortable", () => {
    expect(isSortableColumn({ sortable: true })).toBe(true)
    expect(isSortableColumn({ kind: "sortable-header" })).toBe(true)
    expect(isSortableColumn({ kind: "header" })).toBe(false)
  })

  it("starts a new column desc and toggles the active column", () => {
    expect(nextSortState({ columnId: "pay", direction: "desc" }, "lead")).toEqual({
      columnId: "lead",
      direction: "desc"
    })
    expect(nextSortState({ columnId: "pay", direction: "desc" }, "pay")).toEqual({
      columnId: "pay",
      direction: "asc"
    })
  })

  it("marks the active sort on columns", () => {
    const columns = applySortToColumns(
      [ { id: "lead" }, { id: "pay" } ],
      { columnId: "pay", direction: "asc" }
    )
    expect(columns[1]).toMatchObject({ sortActive: true, sortDirection: "asc" })
    expect(columns[0].sortActive).toBe(false)
  })
})
