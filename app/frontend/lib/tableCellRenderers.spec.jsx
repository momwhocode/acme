/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderCountryCell, renderTableLead, renderTableLink } from "./tableCellRenderers.jsx"

describe("tableCellRenderers", () => {
  it("renders a table link and fires onClick", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(renderTableLink("Engineering", onClick))

    await user.click(screen.getByRole("button", { name: "Engineering" }))
    expect(onClick).toHaveBeenCalled()
  })

  it("wraps a lead cell with an avatar when a user is present", () => {
    render(
      renderTableLead({
        name: "Ada Lovelace",
        user: { first_name: "Ada", last_name: "Lovelace", entityType: "user" },
        onClick: vi.fn()
      })
    )

    expect(screen.getByRole("button", { name: "Ada Lovelace" })).toBeTruthy()
    expect(document.querySelector(".april-table__lead")).toBeTruthy()
  })

  it("shows a country flag before the label", () => {
    render(renderCountryCell("GB"))
    expect(screen.getByText("United Kingdom")).toBeTruthy()
    expect(document.querySelector(".acme-country__flag")?.textContent).toBe("🇬🇧")
  })
})
