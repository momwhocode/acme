/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import AppSidebar from "./AppSidebar"
import { signOut } from "../lib/session"

vi.mock("../lib/session", () => ({
  signOut: vi.fn()
}))

const hr = { first_name: "Ada", last_name: "Lovelace", email: "hr@acme.test" }

function renderSidebar(path = "/", onSignedOut = vi.fn()) {
  return {
    onSignedOut,
    ...render(
      <MemoryRouter initialEntries={[ path ]}>
        <Routes>
          <Route path="/sign_in" element={<p>Sign in page</p>} />
          <Route path="*" element={<AppSidebar user={hr} onSignedOut={onSignedOut} />} />
        </Routes>
      </MemoryRouter>
    )
  }
}

describe("AppSidebar", () => {
  beforeEach(() => {
    signOut.mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("renders Home and Employee Directory and marks the active item", () => {
    renderSidebar("/employees")

    expect(screen.getByLabelText("HR navigation")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Home" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Employee Directory" }).getAttribute("aria-current")).toBe("page")
  })

  it("signs out from the account menu", async () => {
    const user = userEvent.setup()
    const { onSignedOut } = renderSidebar()

    await user.click(screen.getByRole("button", { name: /Account menu for Ada Lovelace/ }))
    await user.click(screen.getByRole("menuitem", { name: "Logout" }))

    await waitFor(() => {
      expect(screen.getByText("Sign in page")).toBeTruthy()
    })
    expect(signOut).toHaveBeenCalled()
    expect(onSignedOut).toHaveBeenCalled()
  })
})
