/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import HomePage from "./HomePage"
import { homeTimeframeAsOf } from "../lib/homeTimeframe"

vi.mock("../lib/analytics", async () => {
  const actual = await vi.importActual("../lib/analytics")
  return { ...actual, getAnalytics: vi.fn() }
})

import { getAnalytics } from "../lib/analytics"

const hr = { first_name: "Ada", last_name: "Lovelace" }

describe("HomePage", () => {
  beforeEach(() => {
    getAnalytics.mockResolvedValue({
      data: {
        headcount: 2,
        annualised_usd: "150000.0",
        average_usd: "75000.0",
        median_usd: "75000.0",
        monthly_usd: "12500.0",
        by_type: [ { employment_type: "full-time", headcount: 2, payroll_usd: "150000.0" } ],
        by_department: [ { department: "engineering", headcount: 2, payroll_usd: "150000.0" } ],
        by_country: [ { country: "GB", headcount: 2, payroll_usd: "150000.0" } ],
        by_currency: [ { currency: "GBP", headcount: 2, payroll_local: "120000.0", payroll_usd: "150000.0" } ]
      }
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("shows payroll KPIs and mix on home", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/" ]}>
        <Routes>
          <Route path="/" element={<HomePage user={hr} />} />
          <Route path="/employees" element={<p>Directory</p>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole("heading", { name: "Welcome Back, Ada!" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Onboard Employee" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Lifetime" })).toBeTruthy()
    expect(await screen.findByText("Annualised payroll")).toBeTruthy()
    expect(screen.getByRole("heading", { name: "By type" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "By department" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "By country" })).toBeTruthy()
    expect(screen.queryByText("Ask payroll")).toBeNull()
    expect(screen.queryByText(/accounts for/)).toBeNull()
    expect(screen.queryByText(/USD quotes/)).toBeNull()

    await user.click(screen.getByRole("button", { name: "View Full Time in directory" }))
    expect(screen.getByText("Directory")).toBeTruthy()
  })

  it("reloads analytics when the timeframe changes", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/" ]}>
        <Routes>
          <Route path="/" element={<HomePage user={hr} />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByText("Annualised payroll")
    expect(getAnalytics).toHaveBeenCalledWith(expect.objectContaining({ as_of: homeTimeframeAsOf({ preset: "lifetime" }) }))

    await user.click(screen.getByRole("button", { name: "Lifetime" }))
    await user.click(screen.getByRole("menuitem", { name: "Last Month" }))

    await waitFor(() => {
      expect(getAnalytics).toHaveBeenLastCalledWith(
        expect.objectContaining({ as_of: homeTimeframeAsOf({ preset: "last_month" }) })
      )
    })
    expect(screen.getByRole("button", { name: /Last Month/ })).toBeTruthy()
  })

  it("toggles local currency", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ "/" ]}>
        <Routes>
          <Route path="/" element={<HomePage user={hr} />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByText("Annualised payroll")
    await user.click(screen.getByRole("tab", { name: "Local" }))
    expect(screen.getByRole("heading", { name: "By currency" })).toBeTruthy()
  })
})
