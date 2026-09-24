/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import OnboardEmployeeModal from "./OnboardEmployeeModal"

vi.mock("../lib/employees", async () => {
  const actual = await vi.importActual("../lib/employees")
  return { ...actual, onboardEmployee: vi.fn() }
})

import { onboardEmployee } from "../lib/employees"

async function chooseOption(user, fieldId, label) {
  await user.click(document.getElementById(`${fieldId}-input-trigger`))
  await user.click(screen.getByRole("menuitem", { name: label }))
}

async function fillHire(user) {
  await user.type(document.getElementById("onboard-first-name"), "Ada")
  await user.type(document.getElementById("onboard-last-name"), "Lovelace")
  await user.type(document.getElementById("onboard-email"), "ada@acme.test")
  await chooseOption(user, "onboard-country", "United Kingdom")
  await chooseOption(user, "onboard-department", "Engineering")
  await chooseOption(user, "onboard-level", "L2")
  await user.type(document.getElementById("onboard-amount"), "80000")
}

describe("OnboardEmployeeModal", () => {
  beforeEach(() => {
    onboardEmployee.mockResolvedValue({ data: { employee: { id: "emp-1" } } })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("shows field errors before calling the API", async () => {
    const user = userEvent.setup()
    render(<OnboardEmployeeModal onCancel={vi.fn()} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Onboard" }))

    expect(screen.getByText("Enter a first name")).toBeTruthy()
    expect(onboardEmployee).not.toHaveBeenCalled()
  })

  it("onboards a hire and reports success", async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(<OnboardEmployeeModal onCancel={vi.fn()} onSuccess={onSuccess} />)
    await fillHire(user)
    await user.click(screen.getByRole("button", { name: "Onboard" }))

    await waitFor(() => {
      expect(onboardEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: "Ada",
          last_name: "Lovelace",
          email: "ada@acme.test",
          country: "GB",
          department: "engineering",
          level: "L2",
          employment_type: "full-time",
          compensation: expect.objectContaining({
            base_amount: "80000",
            currency: "USD",
            pay_period: "annual",
            change_reason: "hire"
          })
        })
      )
    })
    expect(onSuccess).toHaveBeenCalled()
  })
})
