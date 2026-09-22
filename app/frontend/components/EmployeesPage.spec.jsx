/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import EmployeesPage from "./EmployeesPage"

vi.mock("../lib/employees", async () => {
  const actual = await vi.importActual("../lib/employees")
  return {
    ...actual,
    listEmployees: vi.fn()
  }
})

import { listEmployees } from "../lib/employees"

function renderDirectory() {
  return render(
    <MemoryRouter initialEntries={[ "/employees" ]}>
      <Routes>
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/:id" element={<p>Profile</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("EmployeesPage", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
    listEmployees.mockResolvedValue({
      data: {
        employees: [
          {
            id: "emp-1",
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
          }
        ]
      },
      meta: {
        pagination: { page: 1, pages: 3, count: 60, limit: 25 },
        facets: { departments: [ "engineering" ], countries: [ "GB" ] }
      }
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("renders a server-paginated directory page", async () => {
    renderDirectory()

    expect(await screen.findByRole("heading", { name: "Employees" })).toBeTruthy()
    await waitFor(() => {
      expect(listEmployees).toHaveBeenCalled()
    })
    expect(await screen.findByText("Ada Lovelace")).toBeTruthy()
    expect(screen.getByText("Showing 1–25 of 60")).toBeTruthy()
  })

  it("opens the onboard modal from the page header", async () => {
    const user = userEvent.setup()
    renderDirectory()
    await screen.findByRole("heading", { name: "Employees" })

    await user.click(screen.getByRole("button", { name: "Onboard" }))

    expect(screen.getByRole("heading", { name: "Onboard employee" })).toBeTruthy()
  })
})
