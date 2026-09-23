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
    },
    recent: { count: 0, employees: [] }
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
    contracts: { count: 0, employees: [] },
    recent: { count: 0, employees: [] }
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
    contracts: { count: 0, employees: [] },
    recent: { count: 0, employees: [] }
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
    expect(screen.getByText(/annualised run-rate, not actual spend/)).toBeTruthy()
    expect(screen.getByText("Total Annualised Cost")).toBeTruthy()
    expect(screen.getByText("Active Headcount")).toBeTruthy()
    expect(screen.getByText("Median Compensation")).toBeTruthy()
    expect(screen.getByText("Contingent Ratio")).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Headcount by employment type" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Median comp by level" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Where the money goes" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Action center" })).toBeTruthy()
    expect(screen.queryByRole("tab", { name: "Monthly" })).toBeNull()
    expect(screen.getByRole("tab", { name: "USD" })).toBeTruthy()
    expect(document.querySelector(".april-tabs-group__divider")).toBeNull()
    expect(screen.getByText("Employment Type")).toBeTruthy()
    expect(screen.getByText("All Types")).toBeTruthy()
    expect(screen.getByText("L2")).toBeTruthy()
    expect(screen.queryByText(/n=/)).toBeNull()
    expect(screen.getByText("Ada Lovelace")).toBeTruthy()
    expect(screen.getByText("IC2 · Engineering")).toBeTruthy()
    expect(screen.getByText("Median monthly run-rate in USD · L5+ includes L6–L7")).toBeTruthy()

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

  it("reloads analytics for a past month and the full period", async () => {
    const user = userEvent.setup()
    renderHome()
    await screen.findByText("Total Annualised Cost")

    const pastMonth = homeMonthOptions()[1]
    const currentPeriod = defaultHomePeriod()
    await user.click(screen.getByRole("button", { name: homePeriodControlLabel(currentPeriod) }))
    await user.click(screen.getByRole("menuitem", { name: pastMonth.label }))
    await waitFor(() => {
      expect(getAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          as_of: homeTimeframeAsOf({ toDate: true, year: pastMonth.year, month: pastMonth.month })
        })
      )
    })

    const selectedPeriod = { ...currentPeriod, year: pastMonth.year, month: pastMonth.month }
    await user.click(screen.getByRole("button", { name: homePeriodControlLabel(selectedPeriod) }))
    await user.click(screen.getByRole("menuitem", { name: "Full Period" }))
    await waitFor(() => {
      expect(getAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          as_of: homeTimeframeAsOf({
            toDate: false,
            year: pastMonth.year,
            month: pastMonth.month
          })
        })
      )
    })
    expect(screen.getByRole("button", { name: homePeriodControlLabel({ ...selectedPeriod, toDate: false }) })).toBeTruthy()
  })

  it("toggles local currency on the money table", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Where the money goes")
    await user.click(screen.getByRole("tab", { name: "Country" }))
    await user.click(screen.getByRole("tab", { name: "Local" }))
    expect(screen.getByText("Monthly run-rate by country · local")).toBeTruthy()
    expect(screen.getByText(/£120,000/)).toBeTruthy()
    expect(screen.getByText("United Kingdom")).toBeTruthy()
  })

  it("sorts the money table when a column header is clicked", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Where the money goes")
    await user.click(screen.getByRole("button", { name: "Headcount" }))
    expect(screen.getAllByText("Full Time").length).toBe(2)
  })

  it("switches the money table to departments and opens that directory slice", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Where the money goes")
    await user.click(screen.getByRole("tab", { name: "Department" }))
    expect(screen.getByText("Monthly run-rate by department · USD")).toBeTruthy()
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

    await user.click(screen.getByRole("button", { name: /Grace Hopper/ }))
    expect(screen.getByText("Profile")).toBeTruthy()
  })

  it("opens the current action queue in the directory", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Ada Lovelace")
    await user.click(screen.getByRole("button", { name: "Onboard Employee" }))
    expect(screen.getByRole("heading", { name: "Onboard employee" })).toBeTruthy()
  })

  it("opens the current focus in the directory", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Ada Lovelace")
    await user.click(screen.getByRole("button", { name: "Open In Directory" }))
    expect(screen.getByText("Directory")).toBeTruthy()
  })

  it("narrows the snapshot to contingent people from the KPI", async () => {
    const user = userEvent.setup()
    renderHome()

    await screen.findByText("Contingent Ratio")
    await user.click(screen.getByRole("button", { name: /Contingent Ratio/ }))
    await waitFor(() => {
      expect(getAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({ type: "part-time,contractor,freelancer,intern" })
      )
    })
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
