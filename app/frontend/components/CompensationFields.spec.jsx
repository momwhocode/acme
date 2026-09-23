/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import CompensationFields from "./CompensationFields"

const annual = {
  base_amount: "80000",
  currency: "GBP",
  pay_period: "annual",
  hours_per_week: "",
  effective_date: "2026-09-01",
  change_reason: "hire"
}

describe("CompensationFields", () => {
  afterEach(() => {
    cleanup()
  })

  it("hides hours until pay is hourly", () => {
    const { rerender } = render(
      <CompensationFields idPrefix="comp" values={annual} onChange={vi.fn()} />
    )

    expect(document.getElementById("comp-amount").value).toBe("80000")
    expect(document.getElementById("comp-hours")).toBeNull()
    expect(document.getElementById("comp-effective-date")).toBeTruthy()
    expect(document.getElementById("comp-reason")).toBeTruthy()

    rerender(
      <CompensationFields
        idPrefix="comp"
        values={{ ...annual, pay_period: "hourly" }}
        onChange={vi.fn()}
      />
    )
    expect(document.getElementById("comp-hours")).toBeTruthy()
  })

  it("can hide effective date and reason", () => {
    render(
      <CompensationFields
        idPrefix="comp"
        values={annual}
        onChange={vi.fn()}
        showEffectiveDate={false}
        showChangeReason={false}
      />
    )

    expect(document.getElementById("comp-effective-date")).toBeNull()
    expect(document.getElementById("comp-reason")).toBeNull()
  })

  it("notifies parent when amount changes", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CompensationFields idPrefix="comp" values={annual} onChange={onChange} />)

    await user.type(screen.getByPlaceholderText("Amount"), "1")
    expect(onChange).toHaveBeenCalledWith("base_amount", "800001")
  })
})
