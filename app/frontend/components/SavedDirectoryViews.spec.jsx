/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import SavedDirectoryViews from "./SavedDirectoryViews"
import { listSavedViews } from "../lib/directoryPrefs"

describe("SavedDirectoryViews", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("saves the current snapshot and applies a named view", async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const snapshot = {
      filterValues: { country: [ "GB" ] },
      q: "ada",
      columns: [ "email" ],
      sort: { columnId: "lead", direction: "asc" }
    }

    render(<SavedDirectoryViews snapshot={snapshot} onApply={onApply} />)

    await user.click(screen.getByRole("button", { name: "Saved views" }))
    await user.click(screen.getByRole("menuitem", { name: "Save current view" }))
    await user.type(screen.getByPlaceholderText("UK contractors, active"), "UK engineers")
    await user.click(screen.getByRole("button", { name: "Save view" }))

    await waitFor(() => {
      expect(listSavedViews()[0]).toMatchObject({ name: "UK engineers", q: "ada" })
    })

    await user.click(screen.getByRole("button", { name: "Saved views" }))
    await user.click(screen.getByRole("menuitem", { name: "UK engineers" }))
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ name: "UK engineers" }))
  })
})
