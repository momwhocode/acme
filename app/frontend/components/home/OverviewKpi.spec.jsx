/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { OverviewKpi } from "./OverviewKpi"

describe("OverviewKpi", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders a clickable metric with a signed delta tag", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <OverviewKpi
        icon="group"
        label="Headcount"
        value="128"
        delta="+4"
        selected
        onClick={onClick}
      />
    )

    expect(screen.getByText("Headcount")).toBeTruthy()
    expect(screen.getByText("128")).toBeTruthy()
    expect(screen.getByText("+4")).toBeTruthy()
    expect(document.querySelector(".acme-overview__kpi.is-selected")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: /Headcount/ }))
    expect(onClick).toHaveBeenCalled()
  })
})
