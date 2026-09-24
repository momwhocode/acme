/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { useEmployeesDirectory } from "./useEmployeesDirectory.js"
import { listEmployees } from "./employees.js"

vi.mock("./employees.js", async () => {
  const actual = await vi.importActual("./employees.js")
  return { ...actual, listEmployees: vi.fn() }
})

function DirectoryProbe() {
  const location = useLocation()
  const directory = useEmployeesDirectory()

  return (
    <div>
      <p>{`path ${location.pathname}${location.search}`}</p>
      <p>{`count ${directory.pagination.count}`}</p>
      <p>{`loading ${directory.loading ? "yes" : "no"}`}</p>
      <p>{`q ${directory.searchValue}`}</p>
      <button type="button" onClick={() => directory.handleSearchChange("ada")}>
        Search
      </button>
    </div>
  )
}

describe("useEmployeesDirectory", () => {
  beforeEach(() => {
    localStorage.clear()
    listEmployees.mockResolvedValue({
      data: { employees: [] },
      meta: { pagination: { page: 1, pages: 1, count: 0, limit: 25 }, facets: { departments: [] } }
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("reads filters from the URL and writes search back into it", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/employees?type=contractor" ]}>
        <Routes>
          <Route path="/employees" element={<DirectoryProbe />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(listEmployees).toHaveBeenCalled()
    })
    expect(listEmployees.mock.calls[0][0]).toEqual(expect.objectContaining({ type: "contractor" }))

    await user.click(screen.getByRole("button", { name: "Search" }))
    await waitFor(() => {
      expect(screen.getByText(/path \/employees\?q=ada/)).toBeTruthy()
    })
  })
})
