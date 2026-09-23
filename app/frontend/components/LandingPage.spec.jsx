/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import LandingPage from "./LandingPage"

describe("LandingPage", () => {
  afterEach(() => {
    cleanup()
  })

  it("shows the colored product panel and the HR login form", () => {
    render(
      <MemoryRouter>
        <LandingPage onSignedIn={vi.fn()} />
      </MemoryRouter>
    )

    expect(screen.getByRole("heading", { name: "Salary management" })).toBeTruthy()
    expect(screen.getByLabelText("Acme")).toBeTruthy()
    expect(screen.getByLabelText("Email address")).toBeTruthy()
    expect(screen.getByLabelText("Password")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy()
  })
})
