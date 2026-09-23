/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import HomePage from "./HomePage"

vi.mock("../lib/analytics", async () => {
  const actual = await vi.importActual("../lib/analytics")
  return { ...actual, getAnalytics: vi.fn(), askAnalytics: vi.fn() }
})

import { askAnalytics, getAnalytics } from "../lib/analytics"

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
        by_currency: [ { currency: "GBP", headcount: 2, payroll_local: "120000.0", payroll_usd: "150000.0" } ],
        fx_rates: [
          { currency: "USD", to_usd: "1.0" },
          { currency: "GBP", to_usd: "1.25" }
        ]
      }
    })
    askAnalytics.mockResolvedValue({ data: { answer: "Active annualised payroll is 150,000 USD." } })
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

    expect(await screen.findByRole("heading", { name: "Home" })).toBeTruthy()
    expect(screen.getByText("Welcome back, Ada. Compensation source of truth for ACME.")).toBeTruthy()
    expect(await screen.findByText("2 active")).toBeTruthy()
    expect(await screen.findByText("Annualised payroll")).toBeTruthy()
    expect(screen.getByRole("heading", { name: "By type" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "By department" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "By country" })).toBeTruthy()
    expect(screen.getByText("Ask payroll")).toBeTruthy()
    expect(screen.getByText(/Engineering accounts for 100% of active annualised payroll/)).toBeTruthy()
    expect(screen.getByText(/USD quotes/)).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "View Full Time in directory" }))
    expect(screen.getByText("Directory")).toBeTruthy()
  })

  it("toggles local currency and asks a question", async () => {
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

    await user.click(screen.getByRole("button", { name: "What is the total annualised payroll?" }))
    await waitFor(() => {
      expect(askAnalytics).toHaveBeenCalledWith("What is the total annualised payroll?")
    })
    expect(screen.getByText("Active annualised payroll is 150,000 USD.")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Ask" }))
    expect(screen.getByText("Enter a question")).toBeTruthy()
    expect(askAnalytics).toHaveBeenCalledTimes(1)
  })
})
