import { afterEach, describe, expect, it, vi } from "vitest"
import { getAnalytics } from "./analytics.js"
import { analyticsShare, directoryPathFromMix, mixLabel, mixMoney } from "./analyticsDisplay.js"

describe("analytics display", () => {
  it("labels mix rows and formats local money", () => {
    expect(mixLabel({ employment_type: "full-time" }, "employment_type")).toBe("Full Time")
    expect(mixMoney({ payroll_local: 80000, currency: "GBP" }, "local")).toContain("£")
    expect(analyticsShare(25, 100)).toBe(25)
  })

  it("opens the directory on the active mix slice", () => {
    expect(directoryPathFromMix("employment_type", { employment_type: "contractor" })).toBe(
      "/employees?status=active&type=contractor"
    )
    expect(directoryPathFromMix("department", { department: "engineering" })).toBe(
      "/employees?status=active&department=engineering"
    )
    expect(directoryPathFromMix("country", { country: "GB" })).toBe("/employees?status=active&country=GB")
  })
})

describe("analytics requests", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("loads the snapshot", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {} }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await getAnalytics()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/analytics",
      expect.objectContaining({ credentials: "same-origin" })
    )
  })

  it("loads a snapshot for an as_of date", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {} }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await getAnalytics({ as_of: "2026-08-31" })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/analytics?as_of=2026-08-31",
      expect.objectContaining({ credentials: "same-origin" })
    )
  })
})
