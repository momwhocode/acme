/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import HomePage from "./HomePage"
import {
  defaultHomePeriod,
  homeMonthOptions,
  homePeriodControlLabel,
  homeTimeframeAsOf,
  homeTimeframeCompareAsOf
} from "../lib/homeTimeframe"

vi.mock("../lib/analytics", async () => {
  const actual = await vi.importActual("../lib/analytics")
  return { ...actual, getAnalytics: vi.fn() }
})

import { getAnalytics } from "../lib/analytics"

const snapshot = {
  headcount: 2,
  annualised_usd: "150000.0",
  median_usd: "75000.0",
  by_type: [
    {
      employment_type: "full-time",
      headcount: 2,
      payroll_usd: "150000.0",
      payroll_local: "120000.0",
      median_usd: "75000.0",
      currency: "GBP"
    }
  ],
  by_department: [
    {
      department: "engineering",
      headcount: 2,
      payroll_usd: "150000.0",
      payroll_local: "120000.0",
      median_usd: "75000.0"
    }
  ],
  by_country: [
    {
      country: "GB",
      headcount: 2,
      payroll_usd: "150000.0",
      payroll_local: "120000.0",
      median_usd: "75000.0",
      currency: "GBP"
    }
  ],
  by_level: [ { level: "IC2", headcount: 2, payroll_usd: "150000.0", median_usd: "75000.0" } ],
  actions: {
    onboarding: {
      count: 1,
      employees: [
        {
          id: "emp-1",
          first_name: "Ada",
          last_name: "Lovelace",
          department: "engineering",
          level: "IC2",
          event_on: "2026-09-15",
          missing_comp: false
        }
      ]
    },
    offboarding: { count: 0, employees: [] },
    contracts: {
      count: 1,
      employees: [
        {
          id: "emp-2",
          first_name: "Grace",
          last_name: "Hopper",
          department: "engineering",
          level: "IC4",
          event_on: "2026-10-01",
          missing_comp: true
        }
      ]
    }
  }
}

const compareSnapshot = {
  ...snapshot,
  headcount: 1,
  annualised_usd: "100000.0",
  median_usd: "50000.0",
  by_type: [
    {
      employment_type: "full-time",
      headcount: 1,
      payroll_usd: "100000.0",
      payroll_local: "80000.0",
      median_usd: "50000.0",
      currency: "GBP"
    }
  ],
  actions: {
    onboarding: { count: 0, employees: [] },
    offboarding: { count: 0, employees: [] },
    contracts: { count: 0, employees: [] }
  }
}

const emptySnapshot = {
  headcount: 0,
  annualised_usd: 0,
  median_usd: null,
  by_type: [],
  by_department: [],
  by_country: [],
  by_level: [],
  actions: {
    onboarding: { count: 0, employees: [] },
    offboarding: { count: 0, employees: [] },
    contracts: { count: 0, employees: [] }
  }
}

function renderHome(user = { first_name: "Sharvari", last_name: "Potnis" }) {
  return render(
    <MemoryRouter initialEntries={[ "/" ]}>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/employees" element={<p>Directory</p>} />
        <Route path="/employees/:id" element={<p>Profile</p>} />
      </Routes>
    </MemoryRouter>
  )
}

function mockSnapshots(current = snapshot, previous = compareSnapshot) {
  getAnalytics.mockImplementation(({ as_of } = {}) => {
    const compareAsOf = homeTimeframeCompareAsOf(defaultHomePeriod())
    if (as_of === compareAsOf) return Promise.resolve({ data: previous })
    return Promise.resolve({ data: current })
  })
}

describe("HomePage", () => {
  beforeEach(() => {
    mockSnapshots()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("renders the overview snapshot from live analytics", async () => {
    const user = userEvent.setup()
    renderHome()

    expect(await screen.findByRole("heading", { name: "Welcome Back, Sharvari!" })).toBeTruthy()
    expect(screen.queryByText(/annualised run-rate, not actual spend/)).toBeNull()
    expect(screen.queryByRole("button", { name: "Open In Directory" })).toBeNull()
    expect(screen.getByText("Total Annualised Cost")).toBeTruthy()
    expect(screen.getByText(/\/yr$/)).toBeTruthy()
    expect(screen.getByText("Active Headcount")).toBeTruthy()
    expect(screen.getByText("Median Compensation")).toBeTruthy()
    expect(screen.getByText("Contingent Ratio")).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Employment Type" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Comp By Level" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Spend" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Onboarding/Offboarding Tracker" })).toBeTruthy()
    expect(screen.queryByRole("tab", { name: /Recent Changes/ })).toBeNull()
    expect(screen.queryByRole("tab", { name: "Monthly" })).toBeNull()
    expect(screen.getByRole("tab", { name: "USD" })).toBeTruthy()
    expect(document.querySelector(".april-tabs-group__divider")).toBeNull()
    expect(screen.getAllByText("Employment Type").length).toBeGreaterThan(1)
    expect(screen.getByText("All Types")).toBeTruthy()
    expect(screen.getByText("L2")).toBeTruthy()
    expect(screen.queryByText(/n=/)).toBeNull()
    expect(screen.getByText("Ada Lovelace")).toBeTruthy()
    expect(screen.getByText("L2 · Engineering")).toBeTruthy()
    expect(screen.getByText("Median monthly compensation")).toBeTruthy()

    const swatch = document.querySelector(".acme-overview__swatch")
    expect(swatch?.getAttribute("style")).toContain("var(--yellow-yellow-400)")
    const bar = document.querySelector(".acme-overview__bar")
    expect(bar?.getAttribute("style")).toContain("var(--yellow-yellow-400)")

    await user.click(screen.getAllByRole("button", { name: /Full Time/ })[0])
    await waitFor(() => {
      expect(getAnalytics).toHaveBeenCalledWith(expect.objectContaining({ type: "full-time" }))
    })
    expect(screen.getByLabelText("Clear Full Time")).toBeTruthy()
    expect(screen.queryByText("Directory")).toBeNull()
  })

  it("shows deltas against the previous snapshot", async () => {
    renderHome()

    expect(await screen.findByText("+50.0%")).toBeTruthy()
    expect(screen.getByText("+1")).toBeTruthy()
    expect(screen.getByText("+50.00%")).toBeTruthy()
    expect(document.querySelector(".april-tag--success")).toBeTruthy()
    expect(document.querySelector(".acme-overview__kpi .april-tag .april-icon")?.textContent).toBe("arrow_upward")
  })

  it("loads the as_of snapshot for the selected period", async () => {
    renderHome()

    await screen.findByText("Total Annualised Cost")
    expect(getAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ as_of: homeTimeframeAsOf({ toDate: true }) })
    )
    expect(getAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ as_of: homeTimeframeCompareAsOf({ toDate: true }) })
    )
  })

  it("reloads analytics for last month and back to the current month", async () => {
    const user = userEvent.setup()
    renderHome()
    await screen.findByText("Total Annualised Cost")

    const currentMonth = homeMonthOptions()[0]
    const lastMonth = homeMonthOptions()[1]
    await user.click(screen.getByRole("button", { name: homePeriodControlLabel(defaultHomePeriod()) }))
    await user.click(screen.getByRole("menuitem", { name: "Last Month" }))
    await waitFor(() => {
      expect(getAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          as_of: homeTimeframeAsOf({ toDate: false, year: lastMonth.year, month: lastMonth.month })
        })
      )
    })
    expect(screen.getByRole("button", { name: "Last Month" })).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Last Month" }))
    await user.click(screen.getByRole("menuitem", { name: currentMonth.label }))
    await waitFor(() => {
      expect(getAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({ as_of: homeTimeframeAsOf(defaultHomePeriod()) })
      )
    })
    expect(screen.getByRole("button", { name: homePeriodControlLabel(defaultHomePeriod()) })).toBeTruthy()
  })

  it("toggles local currency on the money table", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Spend")
    await user.click(screen.getByRole("tab", { name: "Country" }))
    await user.click(screen.getByRole("tab", { name: "Local" }))
    expect(screen.getByText("Payroll by country")).toBeTruthy()
    expect(screen.getAllByText("₹1.25 Cr").length).toBeGreaterThan(0)
    expect(screen.getByText("United Kingdom")).toBeTruthy()
  })

  it("sorts the money table when a column header is clicked", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Spend")
    await user.click(screen.getByRole("button", { name: "Headcount" }))
    expect(screen.getAllByText("Full Time").length).toBe(2)
  })

  it("switches the money table to departments and opens that directory slice", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Spend")
    await user.click(screen.getByRole("tab", { name: "Department" }))
    expect(screen.getByText("Payroll by department")).toBeTruthy()
    expect(screen.getByText("Engineering")).toBeTruthy()

    await user.click(screen.getByText("Engineering"))
    await waitFor(() => {
      expect(getAnalytics).toHaveBeenCalledWith(expect.objectContaining({ department: "engineering" }))
    })
    expect(screen.getByLabelText("Clear Engineering")).toBeTruthy()
  })

  it("opens a profile from the action center and empty queues", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Ada Lovelace")
    await user.click(screen.getByRole("tab", { name: /Offboarding/ }))
    expect(screen.getByText("Nothing in this queue.")).toBeTruthy()

    await user.click(screen.getByRole("tab", { name: /Contracts Expiring/ }))
    expect(screen.getByText("Grace Hopper")).toBeTruthy()
    expect(screen.getByText("Missing Comp Record")).toBeTruthy()

    await user.click(screen.getByText("Grace Hopper"))
    expect(screen.getByText("Profile")).toBeTruthy()
  })

  it("opens the current action queue in the directory", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Ada Lovelace")
    await user.click(screen.getByRole("button", { name: "Onboard Employee" }))
    expect(screen.getByRole("heading", { name: "Onboard Employee" })).toBeTruthy()
  })

  it("shows View All on every action tab and opens that directory slice", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Ada Lovelace")
    expect(screen.getByRole("button", { name: "View All" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: /Open .* In Directory/ })).toBeNull()

    await user.click(screen.getByRole("tab", { name: /Offboarding/ }))
    expect(screen.getByRole("button", { name: "View All" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: /Open Offboarding/ })).toBeNull()

    await user.click(screen.getByRole("button", { name: "View All" }))
    expect(screen.getByText("Directory")).toBeTruthy()
  })

  it("shows donut and bar tooltips on hover", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Total Annualised Cost")
    expect(screen.queryByRole("button", { name: /Total Annualised Cost/ })).toBeNull()

    await user.hover(document.querySelector(".acme-overview__donut-slice"))
    expect(screen.getByRole("tooltip", { name: /Full Time/ })).toBeTruthy()

    await user.hover(screen.getByRole("button", { name: /L2/ }))
    expect(screen.getByRole("tooltip", { name: /L2/ })).toBeTruthy()
  })

  it("shows empty chart copy when the snapshot has no people", async () => {
    mockSnapshots(emptySnapshot, emptySnapshot)
    renderHome()

    expect(await screen.findByText("No active employees.")).toBeTruthy()
    expect(screen.getByText("No level bands yet.")).toBeTruthy()
    expect(screen.getByText("Nothing in this queue.")).toBeTruthy()
    expect(screen.getByText("All Types")).toBeTruthy()
  })

  it("retries after a load error", async () => {
    const user = userEvent.setup()
    getAnalytics.mockRejectedValueOnce(new Error("offline"))
    renderHome()

    expect(await screen.findByText("Couldn't load home")).toBeTruthy()
    mockSnapshots()
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(await screen.findByText("Total Annualised Cost")).toBeTruthy()
  })
})
