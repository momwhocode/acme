import { afterEach, describe, expect, it } from "vitest"
import {
  listSavedViews,
  readStoredColumns,
  readStoredDirectorySession,
  saveDirectoryView,
  writeStoredColumns,
  writeStoredDirectorySession
} from "./directoryPrefs.js"

afterEach(() => {
  localStorage.clear()
})

describe("directoryPrefs", () => {
  it("persists column ids and the current session", () => {
    writeStoredColumns([ "email", "country" ])
    writeStoredDirectorySession({
      filterValues: { status: [ "active" ] },
      q: "ada",
      sort: { columnId: "pay", direction: "asc" }
    })

    expect(readStoredColumns()).toEqual([ "email", "country" ])
    expect(readStoredDirectorySession()).toEqual({
      filterValues: { status: [ "active" ] },
      q: "ada",
      sort: { columnId: "pay", direction: "asc" }
    })
  })

  it("saves and replaces a named view", () => {
    saveDirectoryView({ name: "UK contractors", filterValues: { country: [ "GB" ] }, q: "" })
    saveDirectoryView({ name: "UK contractors", filterValues: { country: [ "GB" ], type: [ "contractor" ] }, q: "eng" })

    expect(listSavedViews()).toEqual([
      {
        name: "UK contractors",
        filterValues: { country: [ "GB" ], type: [ "contractor" ] },
        q: "eng",
        columns: [],
        sort: { columnId: null, direction: "desc" }
      }
    ])
  })
})
