/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { useFilterChipsHeaderState } from "./useFilterChipsHeaderState.js"

function FilterProbe() {
  const [columns] = useState([
    { id: "lead", kind: "lead", label: "Employee" },
    { id: "email", kind: "header", label: "Email" },
    { id: "country", kind: "header", label: "Country" }
  ])
  const state = useFilterChipsHeaderState({
    columns,
    initialFilterValues: { country: [ "GB" ] },
    initialSearch: "ada"
  })

  return (
    <div>
      <p>{`q ${state.searchValue}`}</p>
      <p>{`country ${state.filterValues.country?.join(",") || ""}`}</p>
      <p>{`columns ${state.visibleColumnIds.join(",")}`}</p>
      <p>{`clear ${state.clearGeneration}`}</p>
      <button type="button" onClick={() => state.onSearchChange("grace")}>
        Search
      </button>
      <button type="button" onClick={() => state.onFilterChange("country", [ "US" ])}>
        Filter
      </button>
      <button type="button" onClick={() => state.onColumnToggle("email")}>
        Hide email
      </button>
      <button type="button" onClick={state.onClearAll}>
        Clear
      </button>
    </div>
  )
}

describe("useFilterChipsHeaderState", () => {
  it("tracks search, filters, column visibility, and clear", async () => {
    const user = userEvent.setup()
    render(<FilterProbe />)

    expect(screen.getByText("q ada")).toBeTruthy()
    expect(screen.getByText("country GB")).toBeTruthy()
    expect(screen.getByText("columns email,country")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Search" }))
    expect(screen.getByText("q grace")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Filter" }))
    expect(screen.getByText("country US")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Hide email" }))
    expect(screen.getByText("columns country")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.getByText("q")).toBeTruthy()
    expect(screen.getByText("country")).toBeTruthy()
    expect(screen.getByText("clear 1")).toBeTruthy()
  })
})
