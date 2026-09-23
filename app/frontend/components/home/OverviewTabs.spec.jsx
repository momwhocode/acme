/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { OverviewTabs } from "./OverviewTabs"

describe("OverviewTabs", () => {
  afterEach(() => {
    cleanup()
  })

  it("marks the active tab and reports the next index", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <OverviewTabs
        id="money-tabs"
        tabs={[ { id: "country", label: "Country" }, { id: "type", label: "Type", count: 3 } ]}
        activeIndex={0}
        onChange={onChange}
      />
    )

    expect(screen.getByRole("tab", { name: "Country" }).getAttribute("aria-selected")).toBe("true")
    expect(screen.getByRole("tab", { name: "Type 3" }).getAttribute("aria-selected")).toBe("false")

    await user.click(screen.getByRole("tab", { name: "Type 3" }))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
