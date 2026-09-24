/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import EmployeeProfilePage from "./EmployeeProfilePage"

vi.mock("../lib/employees", async () => {
  const actual = await vi.importActual("../lib/employees")
  return {
    ...actual,
    getEmployee: vi.fn(),
    rehireEmployee: vi.fn(),
    destroyEmployee: vi.fn(),
    deleteCompensation: vi.fn()
  }
})

import { getEmployee } from "../lib/employees"

describe("EmployeeProfilePage", () => {
  beforeEach(() => {
    getEmployee.mockResolvedValue({
      data: {
        employee: {
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
          left_on: null
        },
        current_compensation: {
          id: "comp-2",
          base_amount: "90000.0",
          currency: "GBP",
          pay_period: "annual",
          effective_date: "2025-04-01",
          change_reason: "promotion",
          annualised_usd: "112500.0"
        },
            compensation_records: [
          {
            id: "comp-2",
            base_amount: "90000.0",
            currency: "GBP",
            pay_period: "annual",
            effective_date: "2025-04-01",
            change_reason: "promotion",
            annualised_usd: "112500.0"
          },
          {
            id: "comp-1",
            base_amount: "80000.0",
            currency: "GBP",
            pay_period: "annual",
            effective_date: "2024-01-01",
            change_reason: "hire",
            annualised_usd: "100000.0"
          }
        ],
        audit_events: [
          {
            id: "aud-1",
            action: "promotion",
            record_type: "CompensationRecord",
            actor_name: "Hr Lead",
            created_at: "2025-04-01T12:00:00.000Z"
          },
          {
            id: "aud-2",
            action: "onboard",
            record_type: "Employee",
            actor_name: "Hr Lead",
            created_at: "2024-01-01T09:00:00.000Z"
          }
        ]
      }
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("shows current compensation and the change timeline", async () => {
    render(
      <MemoryRouter initialEntries={[ "/employees/emp-1" ]}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole("heading", { name: "Ada Lovelace" })).toBeTruthy()
    expect(document.querySelector(".april-modal__title-group .april-avatar")).toBeTruthy()
    expect(document.querySelector(".april-modal__description")).toBeNull()
    expect(screen.getByText("Active")).toBeTruthy()
    expect(screen.getByText("ada@acme.test")).toBeTruthy()
    expect(screen.getByText("United Kingdom")).toBeTruthy()
    expect(screen.getAllByText("1 Jan-2024").length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: "Employee Details" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Job Details" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Compensation Details" })).toBeTruthy()
    expect(screen.getByText("Annual")).toBeTruthy()
    expect(screen.getByText("Annual Salary")).toBeTruthy()
    expect(screen.queryByText("Band")).toBeNull()
    expect(screen.getByRole("heading", { name: "Employment Dates" })).toBeTruthy()
    expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe("true")
    expect(screen.getByRole("tab", { name: "Activity History" }).getAttribute("aria-selected")).toBe("false")
    expect(screen.getByRole("button", { name: "Edit Record" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Record" })).toBeNull()
    expect(screen.getByRole("button", { name: "More Actions" })).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "Audit trail" })).toBeNull()
  })

  it("shows timestamped changes on Activity History", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/employees/emp-1" ]}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole("heading", { name: "Ada Lovelace" })
    await user.click(screen.getByRole("tab", { name: "Activity History" }))
    expect(screen.getByText("Promotion")).toBeTruthy()
    expect(screen.getByText("Onboard")).toBeTruthy()
    expect(screen.getAllByText("Hr Lead").length).toBeGreaterThan(0)
  })

  it("opens the offboard modal from more actions", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/employees/emp-1" ]}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole("heading", { name: "Ada Lovelace" })
    await user.click(screen.getByRole("button", { name: "More Actions" }))
    await user.click(screen.getByRole("menuitem", { name: "Start Offboarding" }))

    expect(screen.getByRole("heading", { name: "Start Offboarding" })).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "Ada Lovelace" })).toBeNull()
  })

  it("opens the edit modal with the current profile", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/employees/emp-1" ]}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole("heading", { name: "Ada Lovelace" })
    await user.click(screen.getByRole("button", { name: "Edit Record" }))

    expect(screen.getByRole("heading", { name: "Edit Employee" })).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "Ada Lovelace" })).toBeNull()
    expect(document.getElementById("edit-first-name").value).toBe("Ada")

    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "Edit Employee" })).toBeNull()
  })

  it("hides offboarding for a leaver", async () => {
    getEmployee.mockResolvedValue({
      data: {
        employee: {
          id: "emp-1",
          first_name: "Ada",
          last_name: "Lovelace",
          email: "ada@acme.test",
          department: "engineering",
          country: "GB",
          employment_type: "full-time",
          status: "left",
          level: "IC2",
          started_on: "2024-01-01",
          left_on: "2026-01-01"
        },
        current_compensation: null,
        compensation_records: []
      }
    })

    render(
      <MemoryRouter initialEntries={[ "/employees/emp-1" ]}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole("heading", { name: "Ada Lovelace" })
    expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe("true")
    expect(screen.getByRole("button", { name: "More Actions" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Edit Record" })).toBeTruthy()
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "More Actions" }))
    expect(screen.queryByRole("menuitem", { name: "Start Offboarding" })).toBeNull()
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeTruthy()
  })

  it("shows a styled missing-employee state", async () => {
    const error = new Error("not found")
    error.code = "not_found"
    getEmployee.mockRejectedValue(error)

    render(
      <MemoryRouter initialEntries={[ "/employees/missing" ]}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole("heading", { name: "Employee not found" })).toBeTruthy()
    expect(screen.getByText("This person is not in the directory.")).toBeTruthy()
  })

  it("closes back to the directory", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/employees/emp-1" ]}>
        <Routes>
          <Route path="/employees" element={<p>Directory</p>} />
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole("heading", { name: "Ada Lovelace" })
    await user.click(screen.getByRole("button", { name: "Close" }))
    expect(screen.getByText("Directory")).toBeTruthy()
  })

  it("keeps directory filters when closing", async () => {
    function DirectoryEcho() {
      const location = useLocation()
      return <p>{`Directory ${location.pathname}${location.search}`}</p>
    }

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/employees/emp-1?status=active&q=ada" ]}>
        <Routes>
          <Route path="/employees" element={<DirectoryEcho />} />
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole("heading", { name: "Ada Lovelace" })
    await user.click(screen.getByRole("button", { name: "Close" }))
    expect(screen.getByText("Directory /employees?status=active&q=ada")).toBeTruthy()
  })
})
