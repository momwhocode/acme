/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { todayIso } from "../lib/formDates"
import OffboardEmployeeModal from "./OffboardEmployeeModal"

vi.mock("../lib/employees", async () => {
  const actual = await vi.importActual("../lib/employees")
  return { ...actual, offboardEmployee: vi.fn() }
})

import { offboardEmployee } from "../lib/employees"

describe("OffboardEmployeeModal", () => {
  beforeEach(() => {
    offboardEmployee.mockResolvedValue({ data: { employee: { id: "emp-1", status: "left" } } })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("marks the employee left", async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(
      <OffboardEmployeeModal
        employee={{ id: "emp-1", started_on: "2024-01-01" }}
        onCancel={vi.fn()}
        onSuccess={onSuccess}
      />
    )

    await user.click(screen.getByRole("button", { name: "Start Offboarding" }))

    await waitFor(() => {
      expect(offboardEmployee).toHaveBeenCalledWith("emp-1", {
        left_on: todayIso(),
        started_on: "2024-01-01"
      })
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it("rejects a leave date before started_on", async () => {
    const user = userEvent.setup()
    render(
      <OffboardEmployeeModal
        employee={{ id: "emp-1", started_on: "2099-01-01" }}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: "Start Offboarding" }))

    expect(screen.getByText("must be on or after started_on")).toBeTruthy()
    expect(offboardEmployee).not.toHaveBeenCalled()
  })
})
