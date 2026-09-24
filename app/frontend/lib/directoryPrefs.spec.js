import { afterEach, describe, expect, it } from "vitest"
import {
  readStoredColumns,
  readStoredDirectorySession,
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
})
