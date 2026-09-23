/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import LoginPage from "./LoginPage"
import { signIn } from "../lib/session"

vi.mock("../lib/session", async () => {
  const actual = await vi.importActual("../lib/session")
  return { ...actual, signIn: vi.fn() }
})

function renderLogin(onSignedIn = vi.fn()) {
  return {
    onSignedIn,
    ...render(
      <MemoryRouter initialEntries={[ "/sign_in" ]}>
        <Routes>
          <Route path="/" element={<p>Home</p>} />
          <Route path="/sign_in" element={<LoginPage onSignedIn={onSignedIn} />} />
        </Routes>
      </MemoryRouter>
    )
  }
}

describe("LoginPage", () => {
  beforeEach(() => {
    signIn.mockResolvedValue({ first_name: "Ada" })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("validates before sending the session request", async () => {
    const user = userEvent.setup()
    const { onSignedIn } = renderLogin()

    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(screen.getByText("Enter your email")).toBeTruthy()
    expect(screen.getByText("Enter your password")).toBeTruthy()
    expect(signIn).not.toHaveBeenCalled()
    expect(onSignedIn).not.toHaveBeenCalled()
  })

  it("signs in and opens Home", async () => {
    const user = userEvent.setup()
    const { onSignedIn } = renderLogin()

    await user.type(screen.getByLabelText("Email address"), "hr@acme.test")
    await user.type(screen.getByLabelText("Password"), "whiteaeroplane")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await waitFor(() => {
      expect(screen.getByText("Home")).toBeTruthy()
    })
    expect(signIn).toHaveBeenCalledWith({ email: "hr@acme.test", password: "whiteaeroplane" })
    expect(onSignedIn).toHaveBeenCalledWith({ first_name: "Ada" })
  })

  it("shows the API error on the email field", async () => {
    signIn.mockRejectedValue(new Error("Invalid email or password"))
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText("Email address"), "hr@acme.test")
    await user.type(screen.getByLabelText("Password"), "whiteaeroplane")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeTruthy()
    })
  })
})
