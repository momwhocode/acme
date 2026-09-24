/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import AppLayout from "./AppLayout"
import { signOut } from "../lib/session"

vi.mock("../lib/session", () => ({
  signOut: vi.fn()
}))

const hr = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "hr@acme.test"
}

function renderShell(path = "/", onSignedOut = vi.fn()) {
  return {
    onSignedOut,
    ...render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/sign_in" element={<p>Sign in page</p>} />
          <Route element={<AppLayout user={hr} onSignedOut={onSignedOut} />}>
            <Route path="/" element={<p>Home content</p>} />
            <Route path="/employees" element={<p>Employees content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }
}

describe("AppLayout", () => {
  beforeEach(() => {
    signOut.mockResolvedValue(undefined)
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("renders the HR sidebar around protected pages", () => {
    renderShell()

    expect(screen.getByLabelText("HR navigation")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Acme" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Home" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Employee Directory" })).toBeTruthy()
    expect(screen.getByText("Home content")).toBeTruthy()
    expect(screen.getByRole("button", { name: /Account menu for Ada Lovelace/ })).toBeTruthy()
  })

  it("marks Employee Directory as the active route", () => {
    renderShell("/employees")

    expect(screen.getByText("Employees content")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Employee Directory" }).getAttribute("aria-current")).toBe("page")
  })

  it("signs out from the profile menu and returns to sign in", async () => {
    const user = userEvent.setup()
    const { onSignedOut } = renderShell()

    await user.click(screen.getByRole("button", { name: /Account menu/ }))
    await user.click(screen.getByRole("menuitem", { name: "Logout" }))

    await waitFor(() => {
      expect(screen.getByText("Sign in page")).toBeTruthy()
    })
    expect(signOut).toHaveBeenCalled()
    expect(onSignedOut).toHaveBeenCalled()
  })

  it("stays signed in when sign out fails", async () => {
    signOut.mockRejectedValue(new Error("Could not sign out"))
    const user = userEvent.setup()
    const { onSignedOut } = renderShell()

    await user.click(screen.getByRole("button", { name: /Account menu/ }))
    await user.click(screen.getByRole("menuitem", { name: "Logout" }))

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled()
    })
    expect(onSignedOut).not.toHaveBeenCalled()
    expect(screen.getByText("Home content")).toBeTruthy()
  })
})
