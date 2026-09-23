import { afterEach, describe, expect, it, vi } from "vitest"
import { analyticsQuestionError, askAnalytics, getAnalytics } from "./analytics.js"
import { analyticsShare, directoryPathFromMix, fxRatesCopy, mixLabel, mixMoney, payrollInsight } from "./analyticsDisplay.js"

describe("analyticsQuestionError", () => {
  it("requires a short question", () => {
    expect(analyticsQuestionError("")).toBe("Enter a question")
    expect(analyticsQuestionError("a".repeat(256))).toBe("question is too long")
    expect(analyticsQuestionError("What is payroll?")).toBe("")
  })
})

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

  it("names the department that holds most payroll", () => {
    expect(
      payrollInsight({
        annualised_usd: 200000,
        by_department: [
          { department: "engineering", payroll_usd: 150000 },
          { department: "sales", payroll_usd: 50000 }
        ]
      })
    ).toBe("Engineering accounts for 75% of active annualised payroll.")
    expect(payrollInsight({ annualised_usd: 0, by_department: [] })).toBe("")
  })

  it("lists USD quotes", () => {
    expect(fxRatesCopy([ { currency: "USD", to_usd: "1.0" }, { currency: "GBP", to_usd: "1.25" } ])).toBe(
      "USD 1 · GBP 1.25"
    )
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

  it("asks a question", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { answer: "ok" } }), { status: 200 })
    )
    vi.stubGlobal("fetch", fetchMock)

    await askAnalytics("What is payroll?")

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/analytics/ask",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ question: "What is payroll?" }) })
    )
  })
})
