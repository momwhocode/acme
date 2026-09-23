/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { useTableRowSelection } from "./tableSelection.js"

function SelectionProbe({ rows, excludeRowId }) {
  const [selectedIds, setSelectedIds] = useState([])
  const { selection, selectedCount } = useTableRowSelection(rows, selectedIds, setSelectedIds, { excludeRowId })

  return (
    <div>
      <p>count {selectedCount}</p>
      <button type="button" onClick={() => selection.onToggleAll(!selection.allSelected)}>
        {selection.allSelected ? "Clear all" : "Select all"}
      </button>
      {rows.map((row) => (
        <button
          key={row.id}
          type="button"
          disabled={!selection.isSelectable(row.id)}
          onClick={() => selection.onToggleRow(row.id)}
        >
          {row.id} {selection.isSelected(row.id) ? "on" : "off"}
        </button>
      ))}
    </div>
  )
}

describe("useTableRowSelection", () => {
  const rows = [ { id: "a" }, { id: "b" }, { id: "skip" } ]

  it("toggles rows and select-all while skipping excluded ids", async () => {
    const user = userEvent.setup()
    render(<SelectionProbe rows={rows} excludeRowId="skip" />)

    await user.click(screen.getByRole("button", { name: "a off" }))
    expect(screen.getByText("count 1")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Select all" }))
    expect(screen.getByText("count 2")).toBeTruthy()
    expect(screen.getByRole("button", { name: "skip off" }).disabled).toBe(true)

    await user.click(screen.getByRole("button", { name: "Clear all" }))
    expect(screen.getByText("count 0")).toBeTruthy()
  })
})
