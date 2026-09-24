/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import EditEmployeeModal from "./EditEmployeeModal"

vi.mock("../lib/employees", async () => {
  const actual = await vi.importActual("../lib/employees")
  return { ...actual, updateEmployee: vi.fn() }
})

import { updateEmployee } from "../lib/employees"

const employee = {
  id: "emp-1",
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@acme.test",
  country: "GB",
  department: "engineering",
  employment_type: "full-time",
  level: "IC2",
  started_on: "2024-01-01"
}

describe("EditEmployeeModal", () => {
  beforeEach(() => {
    updateEmployee.mockResolvedValue({ data: { employee: { id: "emp-1", first_name: "Grace" } } })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("prefills the current profile and saves edits", async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(<EditEmployeeModal employee={employee} onCancel={vi.fn()} onSuccess={onSuccess} />)

    expect(document.getElementById("edit-first-name").value).toBe("Ada")
    expect(document.getElementById("edit-email").value).toBe("ada@acme.test")

    await user.clear(document.getElementById("edit-first-name"))
    await user.type(document.getElementById("edit-first-name"), "Grace")
    await user.click(screen.getByRole("button", { name: "Save changes" }))

    await waitFor(() => {
      expect(updateEmployee).toHaveBeenCalledWith(
        "emp-1",
        expect.objectContaining({
          first_name: "Grace",
          last_name: "Lovelace",
          email: "ada@acme.test",
          country: "GB",
          department: "engineering",
          level: "L2"
        })
      )
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it("shows field errors before calling the API", async () => {
    const user = userEvent.setup()
    render(<EditEmployeeModal employee={employee} onCancel={vi.fn()} onSuccess={vi.fn()} />)

    await user.clear(document.getElementById("edit-first-name"))
    await user.click(screen.getByRole("button", { name: "Save changes" }))

    expect(screen.getByText("Enter a first name")).toBeTruthy()
    expect(updateEmployee).not.toHaveBeenCalled()
  })
})
