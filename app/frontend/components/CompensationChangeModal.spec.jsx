/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import CompensationChangeModal from "./CompensationChangeModal"

vi.mock("../lib/employees", async () => {
  const actual = await vi.importActual("../lib/employees")
  return { ...actual, addCompensation: vi.fn() }
})

import { addCompensation } from "../lib/employees"

const employee = { id: "emp-1", level: "IC2" }
const current = {
  base_amount: "80000.0",
  currency: "GBP",
  pay_period: "annual",
  hours_per_week: null
}

describe("CompensationChangeModal", () => {
  beforeEach(() => {
    addCompensation.mockResolvedValue({ data: { compensation_record: { id: "comp-2" } } })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("prefills current pay and records a change", async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(
      <CompensationChangeModal
        employee={employee}
        currentCompensation={current}
        onCancel={vi.fn()}
        onSuccess={onSuccess}
      />
    )

    expect(document.getElementById("comp-change-amount").value).toBe("80000.0")
    await user.clear(document.getElementById("comp-change-amount"))
    await user.type(document.getElementById("comp-change-amount"), "90000")
    await user.type(document.getElementById("comp-change-reason"), "promotion")
    await user.click(screen.getByRole("button", { name: "Save change" }))

    await waitFor(() => {
      expect(addCompensation).toHaveBeenCalledWith(
        "emp-1",
        expect.objectContaining({
          base_amount: "90000",
          currency: "GBP",
          pay_period: "annual",
          change_reason: "promotion",
          level: "L2"
        })
      )
    })
    expect(onSuccess).toHaveBeenCalled()
  })
})
