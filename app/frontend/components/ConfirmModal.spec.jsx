/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import ConfirmModal from "./ConfirmModal"

describe("ConfirmModal", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders copy and fires confirm or cancel", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <ConfirmModal
        title="Delete Ada Lovelace?"
        description="Removes this hire. This action cannot be undone."
        confirm="Delete"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    )

    expect(screen.getByRole("heading", { name: "Delete Ada Lovelace?" })).toBeTruthy()
    expect(screen.getByText("Removes this hire. This action cannot be undone.")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onCancel).toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(onConfirm).toHaveBeenCalled()
  })
})
