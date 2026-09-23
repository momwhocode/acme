/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import StatusPage from "./StatusPage"

describe("StatusPage", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders not-found copy and secondary action", async () => {
    const user = userEvent.setup()
    const onSecondary = vi.fn()
    render(<StatusPage onSecondary={onSecondary} />)

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Back to home" }))
    expect(onSecondary).toHaveBeenCalled()
  })

  it("renders server-error copy with a primary action", async () => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    render(
      <StatusPage
        variant="server_error"
        showPrimary
        primaryLabel="Reload"
        onPrimary={onPrimary}
      />
    )

    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Reload" }))
    expect(onPrimary).toHaveBeenCalled()
  })
})
