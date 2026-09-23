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

  it("renders a primary action when asked", async () => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    render(
      <StatusPage
        showPrimary
        primaryLabel="Employees"
        onPrimary={onPrimary}
      />
    )

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Employees" }))
    expect(onPrimary).toHaveBeenCalled()
  })
})
