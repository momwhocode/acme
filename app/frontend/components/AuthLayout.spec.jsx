/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import AuthLayout from "./AuthLayout"

describe("AuthLayout", () => {
  afterEach(() => {
    cleanup()
    document.documentElement.removeAttribute("data-app-chrome")
  })

  it("renders signed-out chrome and sets scroll document chrome", () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <p>Sign in form</p>
        </AuthLayout>
      </MemoryRouter>
    )

    expect(screen.getByText("Sign in form")).toBeTruthy()
    expect(screen.getByText(`© ${new Date().getFullYear()} ACME. All rights reserved.`)).toBeTruthy()
    expect(document.documentElement.getAttribute("data-app-chrome")).toBe("scroll")
  })

  it("renders the outlet when children are omitted", () => {
    render(
      <MemoryRouter initialEntries={[ "/" ]}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<p>Outlet form</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText("Outlet form")).toBeTruthy()
  })
})
