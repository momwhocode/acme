/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { employeeTableRow } from "./employeesTable.js"
import { createEmployeesTableExtensions } from "./employeesTableExtensions.jsx"

const employee = {
  id: "emp-1",
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@acme.test",
  department: "engineering",
  country: "GB",
  employment_type: "full-time",
  status: "active",
  started_on: "2024-01-01"
}

describe("createEmployeesTableExtensions", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders a country flag and label", () => {
    const extensions = createEmployeesTableExtensions({})
    render(extensions.renderBodyContent({ id: "country" }, employeeTableRow(employee)))

    expect(screen.getByText("United Kingdom")).toBeTruthy()
    expect(screen.getByText("🇬🇧")).toBeTruthy()
  })

  it("opens the profile from the employee name", () => {
    const onDetails = vi.fn()
    const row = employeeTableRow(employee)
    const extensions = createEmployeesTableExtensions({ onDetails })
    render(extensions.renderBodyContent({ id: "lead", kind: "lead" }, row))

    screen.getByRole("button", { name: "Ada Lovelace" }).click()
    expect(onDetails).toHaveBeenCalledWith(row)
  })

  it("omits start offboarding for a leaver", async () => {
    const user = userEvent.setup()
    const row = employeeTableRow({ ...employee, status: "left", left_on: "2026-01-01" })
    const extensions = createEmployeesTableExtensions({ onDetails: vi.fn(), onOffboard: vi.fn() })
    render(extensions.renderBodyContent({ id: "actions", kind: "actions" }, row))

    await user.click(screen.getByRole("button", { name: "Actions for Ada Lovelace" }))
    expect(screen.getByRole("menuitem", { name: "View profile" })).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: "Rehire" })).toBeTruthy()
    expect(screen.queryByRole("menuitem", { name: "Start Offboarding" })).toBeNull()
  })
})
