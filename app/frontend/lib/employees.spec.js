import { afterEach, describe, expect, it, vi } from "vitest"
import {
  addCompensation,
  compensationChangeErrors,
  compensationErrors,
  directoryFilterErrors,
  employeeIdentityErrors,
  fieldErrorText,
  firstApiFieldError,
  getEmployee,
  importErrors,
  importToastTitle,
  listEmployees,
  importEmployees,
  offboardEmployee,
  offboardErrors,
  onboardEmployee,
  onboardErrors,
  updateCompensation,
  updateEmployee,
  deleteCompensation,
  destroyEmployee,
  exportEmployees,
  rehireEmployee
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

  it("rejects a search that is too long", () => {
    expect(directoryFilterErrors({ q: "a".repeat(256) })).toEqual({ q: "q is too long" })
  })

  it("accepts a comma-separated country list", () => {
    expect(directoryFilterErrors({ country: "GB,US" })).toEqual({})
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

  it("rejects daily and monthly pay on new or edited rows", () => {
    expect(compensationErrors({ base_amount: 1, currency: "USD", pay_period: "monthly" })).toEqual({
      pay_period: "unknown pay period"
    })
    expect(compensationErrors({ base_amount: 1, currency: "USD", pay_period: "daily" })).toEqual({
      pay_period: "unknown pay period"
    })
  })
})

describe("compensationChangeErrors", () => {
  it("requires an effective date", () => {
    expect(compensationChangeErrors({ base_amount: 1, currency: "USD", pay_period: "annual" })).toEqual({
      effective_date: "Enter an effective date"
    })
  })
})

describe("fieldErrorText", () => {
  it("reads the first API detail message", () => {
    expect(fieldErrorText([ "has already been taken" ])).toBe("has already been taken")
    expect(firstApiFieldError({ email: [ "has already been taken" ] })).toBe("has already been taken")
  })
})

describe("employeeIdentityErrors", () => {
  const valid = {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@acme.test",
    country: "GB",
    department: "engineering",
    employment_type: "full-time",
    started_on: "2024-01-01"
  }

  it("accepts identity fields without compensation", () => {
    expect(employeeIdentityErrors(valid)).toEqual({})
  })

  it("requires name, email, and start date", () => {
    expect(employeeIdentityErrors({})).toMatchObject({
      first_name: "Enter a first name",
      email: "Enter an email",
      started_on: "Enter a start date"
    })
  })
})

describe("offboardErrors", () => {
  it("requires an ISO leave date", () => {
    expect(offboardErrors({})).toEqual({ left_on: "left_on is required" })
    expect(offboardErrors({ left_on: "June 1" })).toEqual({ left_on: "left_on is invalid" })
  })

  it("rejects a leave date before started_on", () => {
    expect(offboardErrors({ left_on: "2023-12-01", started_on: "2024-01-01" })).toEqual({
      left_on: "must be on or after started_on"
    })
  })
})

describe("importErrors", () => {
  it("requires a CSV under the size cap", () => {
    expect(importErrors()).toEqual({ file: "Choose a CSV file" })
    expect(importErrors(new File([ "x" ], "people.txt", { type: "text/plain" }))).toEqual({
      file: "upload a CSV file"
    })
    expect(importErrors(new File([ "a" ], "people.csv", { type: "text/csv" }))).toEqual({})
  })

  it("rejects a file over the size cap", () => {
    expect(importErrors({ name: "people.csv", type: "text/csv", size: 5 * 1024 * 1024 + 1 })).toEqual({
      file: "file is too large"
    })
  })
})

describe("importToastTitle", () => {
  it("names imported and updated counts", () => {
    expect(importToastTitle({ data: { employees: 2 } })).toBe("Imported 2 employees")
    expect(importToastTitle({ employees: 0, updated: 2 })).toBe("Imported 0 employees · updated 2")
    expect(importToastTitle({ employees: 1 })).toBe("Imported 1 employee")
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

  it("does not call the API when q is too long", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(listEmployees({ q: "a".repeat(256) })).rejects.toThrow("q is too long")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("loads an employee profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { employee: { id: "emp-1" } } }), { status: 200 })
    )
    vi.stubGlobal("fetch", fetchMock)

    await getEmployee("emp-1")

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/emp-1",
      expect.objectContaining({ credentials: "same-origin" })
    )
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

  it("does not call the API when a pay change is missing an effective date", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(addCompensation("emp-1", { base_amount: 1, currency: "USD", pay_period: "annual" })).rejects.toThrow(
      "Enter an effective date"
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("attaches API field details to the thrown error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "validation_failed",
              message: "validation failed",
              details: { email: [ "has already been taken" ] }
            }
          }),
          { status: 422 }
        )
      )
    )

    await expect(
      onboardEmployee({
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@acme.test",
        country: "GB",
        department: "engineering",
        employment_type: "full-time",
        started_on: "2024-01-01",
        compensation: { base_amount: 80000, currency: "GBP", pay_period: "annual" }
      })
    ).rejects.toMatchObject({
      message: "validation failed",
      details: { email: [ "has already been taken" ] }
    })
  })

  it("updates an employee", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    const payload = {
      first_name: "Grace",
      last_name: "Hopper",
      email: "grace@acme.test",
      country: "US",
      department: "sales",
      employment_type: "full-time",
      started_on: "2024-01-01"
    }

    await updateEmployee("emp-1", payload)

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/emp-1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify(payload) })
    )
  })

  it("does not call the API when an update is missing a name", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(updateEmployee("emp-1", { last_name: "Hopper" })).rejects.toThrow("Enter a first name")
    expect(fetchMock).not.toHaveBeenCalled()
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

  it("imports a CSV without forcing a JSON content type", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { employees: 1 } }), { status: 200 })
    )
    vi.stubGlobal("fetch", fetchMock)
    const file = new File([ "first_name\nAda" ], "people.csv", { type: "text/csv" })

    await importEmployees(file)

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/import",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) })
    )
    expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBeUndefined()
  })

  it("does not call the API when no file is chosen", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(importEmployees()).rejects.toThrow("Choose a CSV file")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("corrects a pay row", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    const payload = { base_amount: 81000, currency: "GBP", pay_period: "annual", effective_date: "2024-01-01" }

    await updateCompensation("emp-1", "comp-1", payload)

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/emp-1/compensation_records/comp-1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify(payload) })
    )
  })

  it("deletes a pay row", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await deleteCompensation("emp-1", "comp-1")

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/emp-1/compensation_records/comp-1",
      expect.objectContaining({ method: "DELETE" })
    )
  })

  it("rehires and deletes an employee", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await rehireEmployee("emp-1")
    await destroyEmployee("emp-1")

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/v1/employees/emp-1/rehire",
      expect.objectContaining({ method: "PATCH" })
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/v1/employees/emp-1",
      expect.objectContaining({ method: "DELETE" })
    )
  })

  it("exports the filtered directory", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Name,Email\nAda,ada@acme.test", { status: 200, headers: { "Content-Type": "text/csv" } })
    )
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("URL", { createObjectURL: () => "blob:export", revokeObjectURL: vi.fn() })

    await exportEmployees({ country: "GB" })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/export?country=GB",
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: "text/csv" })
      })
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

  it("raises an internal error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "internal_error", message: "internal error" } }), { status: 500 })
      )
    )

    await expect(listEmployees()).rejects.toThrow("internal error")
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
