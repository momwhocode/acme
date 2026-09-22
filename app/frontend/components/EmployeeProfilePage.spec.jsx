/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import EmployeeProfilePage from "./EmployeeProfilePage"

vi.mock("../lib/employees", async () => {
  const actual = await vi.importActual("../lib/employees")
  return { ...actual, getEmployee: vi.fn() }
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
    expect(screen.getByRole("heading", { name: "Current compensation" })).toBeTruthy()
    expect(screen.getByText("Current")).toBeTruthy()
    expect(screen.getByText("Promotion")).toBeTruthy()
    expect(screen.getByText("Hire")).toBeTruthy()
  })

  it("opens the pay-change modal for an active employee", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/employees/emp-1" ]}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole("heading", { name: "Ada Lovelace" })
    await user.click(screen.getByRole("button", { name: "Record pay change" }))

    expect(screen.getByRole("heading", { name: "Record pay change" })).toBeTruthy()
  })

  it("hides pay-change for a leaver", async () => {
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
    expect(screen.queryByRole("button", { name: "Record pay change" })).toBeNull()
  })
})
