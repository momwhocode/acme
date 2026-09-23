/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import LogoutPage from "./LogoutPage"
import { signOut } from "../lib/session"

vi.mock("../lib/session", () => ({
  signOut: vi.fn()
}))

function renderLogout(onSignedOut = vi.fn()) {
  return {
    onSignedOut,
    ...render(
      <MemoryRouter initialEntries={[ "/sign_out" ]}>
        <Routes>
          <Route path="/" element={<p>Home</p>} />
          <Route path="/sign_in" element={<p>Sign in page</p>} />
          <Route path="/sign_out" element={<LogoutPage onSignedOut={onSignedOut} />} />
        </Routes>
      </MemoryRouter>
    )
  }
}

describe("LogoutPage", () => {
  beforeEach(() => {
    signOut.mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("signs out and returns to sign in", async () => {
    const user = userEvent.setup()
    const { onSignedOut } = renderLogout()

    await user.click(screen.getByRole("button", { name: "Sign out" }))

    await waitFor(() => {
      expect(screen.getByText("Sign in page")).toBeTruthy()
    })
    expect(signOut).toHaveBeenCalled()
    expect(onSignedOut).toHaveBeenCalled()
  })

  it("stays signed in and returns Home", async () => {
    const user = userEvent.setup()
    renderLogout()

    await user.click(screen.getByRole("button", { name: "Stay signed in" }))
    expect(screen.getByText("Home")).toBeTruthy()
    expect(signOut).not.toHaveBeenCalled()
  })

  it("keeps the confirmation when sign out fails", async () => {
    signOut.mockRejectedValue(new Error("Could not sign out"))
    const user = userEvent.setup()
    const { onSignedOut } = renderLogout()

    await user.click(screen.getByRole("button", { name: "Sign out" }))

    await waitFor(() => {
      expect(screen.getByText("Could not sign out")).toBeTruthy()
    })
    expect(onSignedOut).not.toHaveBeenCalled()
  })
})
