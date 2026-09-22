import { afterEach, describe, expect, it, vi } from "vitest"
import {
  addCompensation,
  compensationErrors,
  directoryFilterErrors,
  listEmployees,
  offboardEmployee,
  offboardErrors,
  onboardEmployee,
  onboardErrors
} from "./employees.js"

describe("directoryFilterErrors", () => {
  it("accepts blank filters", () => {
    expect(directoryFilterErrors({})).toEqual({})
  })

  it("rejects an unknown type, status, or country", () => {
    expect(directoryFilterErrors({ country: "USA", type: "contractor-plus", status: "onboarding" })).toEqual({
      country: "unknown country",
      type: "unknown type",
      status: "unknown status"
    })
  })
})

describe("onboardErrors", () => {
  const valid = {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@acme.test",
    country: "GB",
    department: "engineering",
    employment_type: "full-time",
    started_on: "2024-01-01",
    compensation: { base_amount: 80000, currency: "GBP", pay_period: "annual", effective_date: "2024-01-01" }
  }

  it("accepts a complete hire", () => {
    expect(onboardErrors(valid)).toEqual({})
  })

  it("requires compensation and identity fields", () => {
    expect(onboardErrors({})).toMatchObject({
      first_name: "Enter a first name",
      email: "Enter an email",
      compensation: "compensation is required"
    })
  })
})

describe("compensationErrors", () => {
  it("requires hours for hourly pay", () => {
    expect(compensationErrors({ base_amount: 40, currency: "USD", pay_period: "hourly" })).toEqual({
      hours_per_week: "hours_per_week is required for hourly pay"
    })
  })

  it("rejects an unknown currency or pay period", () => {
    expect(compensationErrors({ base_amount: 1, currency: "JPY", pay_period: "weekly" })).toEqual({
      currency: "unknown currency",
      pay_period: "unknown pay period"
    })
  })
})

describe("offboardErrors", () => {
  it("requires an ISO leave date", () => {
    expect(offboardErrors({})).toEqual({ left_on: "left_on is required" })
    expect(offboardErrors({ left_on: "June 1" })).toEqual({ left_on: "left_on is invalid" })
  })
})

describe("employee requests", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("lists employees with query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ employees: [], pagination: { page: 1 } }), { status: 200 })
    )
    vi.stubGlobal("fetch", fetchMock)

    await listEmployees({ country: "GB", q: "ada", page: 2 })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees?country=GB&q=ada&page=2",
      expect.objectContaining({ credentials: "same-origin" })
    )
  })

  it("does not call the API when directory filters are invalid", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(listEmployees({ type: "contractor-plus" })).rejects.toThrow("unknown type")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("onboards an employee", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ employee: { email: "ada@acme.test" } }), { status: 201 })
    )
    vi.stubGlobal("fetch", fetchMock)
    const payload = {
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@acme.test",
      country: "GB",
      department: "engineering",
      employment_type: "full-time",
      started_on: "2024-01-01",
      compensation: { base_amount: 80000, currency: "GBP", pay_period: "annual" }
    }

    await onboardEmployee(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees",
      expect.objectContaining({ method: "POST", body: JSON.stringify(payload) })
    )
  })

  it("records a compensation change", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
    const payload = { base_amount: 90000, currency: "GBP", pay_period: "annual", effective_date: "2025-04-01" }

    await addCompensation("emp-1", payload)

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/emp-1/compensation_records",
      expect.objectContaining({ method: "POST", body: JSON.stringify(payload) })
    )
  })

  it("offboards an employee", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await offboardEmployee("emp-1", { left_on: "2025-06-01" })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/emp-1/offboard",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ left_on: "2025-06-01" }) })
    )
  })

  it("raises the API error payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "invalid_request", message: "already left" } }), { status: 422 })
      )
    )

    await expect(offboardEmployee("emp-1", { left_on: "2025-06-01" })).rejects.toThrow("already left")
  })
})
