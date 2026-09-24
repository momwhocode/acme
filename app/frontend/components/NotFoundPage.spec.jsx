/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import NotFoundPage from "./NotFoundPage"

describe("NotFoundPage", () => {
  afterEach(() => {
    cleanup()
  })

  it("sends signed-out visitors to sign in", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/missing" ]}>
        <Routes>
          <Route path="/sign_in" element={<p>Sign in page</p>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Sign in" }))
    expect(screen.getByText("Sign in page")).toBeTruthy()
  })

  it("sends signed-in visitors to the directory", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/missing" ]}>
        <Routes>
          <Route path="/employees" element={<p>Directory</p>} />
          <Route path="*" element={<NotFoundPage signedIn />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole("button", { name: "Employee Directory" }))
    expect(screen.getByText("Directory")).toBeTruthy()
  })
})
