/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import AppShell from "./AppShell"

function renderShell() {
  return render(
    <MemoryRouter>
      <AppShell sidebar={<aside className="april-sidebar" id="hr-sidebar">Sidebar</aside>}>
        <p>Page body</p>
      </AppShell>
    </MemoryRouter>
  )
}

describe("AppShell", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: String(query).includes("768"),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    document.body.style.overflow = ""
  })

  it("opens and closes the mobile navigation drawer", async () => {
    const user = userEvent.setup()
    renderShell()

    expect(screen.getByText("Page body")).toBeTruthy()
    expect(document.querySelector(".april-sidebar").getAttribute("aria-hidden")).toBe("true")

    await user.click(screen.getByRole("button", { name: "Open navigation" }))
    expect(document.querySelector(".superadmin-shell--nav-open")).toBeTruthy()
    expect(document.querySelector(".april-sidebar").getAttribute("aria-hidden")).toBeNull()

    await user.click(screen.getByRole("button", { name: "Close navigation" }))
    expect(document.querySelector(".superadmin-shell--nav-open")).toBeNull()
  })
})
