import { afterEach, describe, expect, it, vi } from "vitest"
import { getAnalytics } from "./analytics.js"
import {
  analyticsParamsFromFocus,
  directoryPathFromFocus,
  directoryPathFromMix,
  toggleFocus
} from "./analyticsDisplay.js"

describe("directoryPathFromMix", () => {
  it("opens the directory on the active mix slice", () => {
    expect(directoryPathFromMix("employment_type", { employment_type: "contractor" })).toBe(
      "/employees?status=active&type=contractor"
    )
    expect(directoryPathFromMix("department", { department: "engineering" })).toBe(
      "/employees?status=active&department=engineering"
    )
    expect(directoryPathFromMix("country", { country: "GB" })).toBe("/employees?status=active&country=GB")
  })

  it("keeps only the active status when the slice has no filter value", () => {
    expect(directoryPathFromMix("country", {})).toBe("/employees?status=active")
  })

  it("opens a level bucket in the directory", () => {
    expect(directoryPathFromMix("level", { level: "L2" })).toBe("/employees?status=active&level=L2")
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

  it("loads a filtered snapshot", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {} }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await getAnalytics({ as_of: "2026-08-31", type: "full-time", level: "L2" })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/analytics?as_of=2026-08-31&type=full-time&level=L2",
      expect.objectContaining({ credentials: "same-origin" })
    )
  })
})

describe("home focus", () => {
  it("maps a focus into analytics and directory params", () => {
    const focus = { key: "department", value: "engineering", label: "Engineering" }
    expect(analyticsParamsFromFocus(focus)).toEqual({ department: "engineering" })
    expect(directoryPathFromFocus(focus)).toBe("/employees?status=active&department=engineering")
    expect(directoryPathFromFocus(null)).toBe("/employees?status=active")
    expect(toggleFocus(focus, focus)).toBeNull()
    expect(toggleFocus(null, focus)).toEqual(focus)
  })
})
