/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { OverviewDonut } from "./OverviewDonut"

describe("OverviewDonut", () => {
  afterEach(() => {
    cleanup()
  })

  it("shows a slice tooltip on hover", async () => {
    const user = userEvent.setup()
    render(
      <OverviewDonut
        total={4}
        slices={[
          { key: "full-time", label: "Full Time", headcount: 3, color: "var(--yellow-yellow-400)" },
          { key: "contractor", label: "Contractor", headcount: 1, color: "var(--orange-orange-500)" }
        ]}
      />
    )

    expect(screen.getByRole("img", { name: "Employment Type" })).toBeTruthy()
    expect(screen.queryByRole("tooltip")).toBeNull()

    await user.hover(document.querySelectorAll(".acme-overview__donut-slice")[0])
    expect(screen.getByRole("tooltip").textContent).toMatch(/Full Time · 3 · 75\.0%/)
  })
})
