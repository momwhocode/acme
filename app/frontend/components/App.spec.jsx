/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import App from "./App"

vi.mock("../lib/session", () => ({
  readSession: vi.fn()
}))

vi.mock("../lib/employees", async () => {
  const actual = await vi.importActual("../lib/employees")
  return { ...actual, listEmployees: vi.fn(), getEmployee: vi.fn() }
})

vi.mock("../lib/analytics", async () => {
  const actual = await vi.importActual("../lib/analytics")
  return { ...actual, getAnalytics: vi.fn() }
})

import { SESSION_EXPIRED_EVENT } from "../lib/http"
import { getAnalytics } from "../lib/analytics"
import { getEmployee, listEmployees } from "../lib/employees"
import { readSession } from "../lib/session"

describe("App routes", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
    listEmployees.mockResolvedValue({
      data: { employees: [] },
      meta: { pagination: { count: 0 }, facets: { countries: [], departments: [] } }
    })
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
          started_on: "2024-01-01"
        },
        current_compensation: null,
        compensation_records: []
      }
    })
    getAnalytics.mockResolvedValue({
      data: {
        headcount: 0,
        annualised_usd: 0,
        by_type: [],
        by_department: [],
        by_country: [],
        by_level: [],
        actions: {
          onboarding: { count: 0, employees: [] },
          offboarding: { count: 0, employees: [] },
          contracts: { count: 0, employees: [] },
        }
      }
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    window.history.replaceState({}, "", "/")
  })

  it("shows the public landing when there is no session", async () => {
    readSession.mockResolvedValue(null)
    render(<App />)

    expect(await screen.findByRole("heading", { name: "Salary management" })).toBeTruthy()
  })

  it("shows a styled 404 for an unknown public path", async () => {
    readSession.mockResolvedValue(null)
    window.history.replaceState({}, "", "/missing-route")
    render(<App />)

    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy()
  })

  it("shows the signed-in home for the HR session", async () => {
    readSession.mockResolvedValue({ first_name: "Ada", last_name: "Lovelace", email: "hr@acme.test" })
    render(<App />)

    expect(await screen.findByRole("heading", { name: "Welcome Back, Ada!" })).toBeTruthy()
    expect(screen.getByLabelText("HR navigation")).toBeTruthy()
  })

  it("returns to the landing page when the session expires", async () => {
    readSession.mockResolvedValue({ first_name: "Ada", last_name: "Lovelace", email: "hr@acme.test" })
    render(<App />)

    expect(await screen.findByRole("heading", { name: "Welcome Back, Ada!" })).toBeTruthy()

    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))

    expect(await screen.findByRole("heading", { name: "Salary management" })).toBeTruthy()
  })

  it("refreshes the session when the tab becomes visible", async () => {
    readSession.mockResolvedValue({ first_name: "Ada", last_name: "Lovelace", email: "hr@acme.test" })
    render(<App />)

    expect(await screen.findByRole("heading", { name: "Welcome Back, Ada!" })).toBeTruthy()

    readSession.mockResolvedValue(null)
    document.dispatchEvent(new Event("visibilitychange"))

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Salary management" })).toBeTruthy()
    })
  })

  it("opens a nested employee profile over the directory", async () => {
    readSession.mockResolvedValue({ first_name: "Ada", last_name: "Lovelace", email: "hr@acme.test" })
    window.history.replaceState({}, "", "/employees/emp-1")
    render(<App />)

    expect(await screen.findByRole("heading", { name: "Ada Lovelace" })).toBeTruthy()
    expect(screen.getByLabelText("HR navigation")).toBeTruthy()
  })
})
