import { describe, expect, it } from "vitest"
import {
  LEVEL_COLORS,
  TYPE_COLORS,
  actionRole,
  buildOverviewModel,
  conicGradient,
  contingentStats,
  deltaTagProps,
  formatCompactUsd,
  formatCount,
  formatMonthlyUsd,
  formatPct,
  formatSignedCount,
  formatSignedPct,
  formatSignedPts,
  levelBucket,
  levelBars,
  moneyCell,
  moneyRows,
  moneyTableColumns,
  pctShare,
  sortMoneyRows,
  typeSlices,
} from "./homeOverview.js"

describe("homeOverview formatters", () => {
  it("formats compact payroll figures", () => {
    expect(formatCompactUsd(60_000_000)).toBe("$60M")
    expect(formatCompactUsd(8_100_000)).toBe("$8.1M")
    expect(formatCompactUsd(13_200)).toBe("$13.2K")
    expect(formatCompactUsd(0)).toBe("$0")
    expect(formatMonthlyUsd(58_260)).toBe("$4,855")
    expect(formatMonthlyUsd(null)).toBe("—")
    expect(formatCount(10000)).toBe("10,000")
    expect(formatPct(22.64)).toBe("22.6%")
    expect(pctShare(25, 0)).toBe(0)
    expect(pctShare(25, 100)).toBe(25)
  })

  it("formats signed deltas and their tone", () => {
    expect(formatSignedPct(104, 100)).toBe("+4.0%")
    expect(formatSignedPct(100, 100)).toBe("0.0%")
    expect(formatSignedPct(96, 100)).toBe("-4.0%")
    expect(formatSignedPct(10, 0)).toBeNull()
    expect(formatSignedCount(12, 10)).toBe("+2")
    expect(formatSignedCount(8, 10)).toBe("-2")
    expect(formatSignedCount(8, null)).toBeNull()
    expect(formatSignedPts(22.6, 22.6)).toBe("0.0 pts")
    expect(formatSignedPts(23.1, 22.6)).toBe("+0.5 pts")
    expect(deltaTagProps("+4.0%")).toEqual({ type: "success", leadingIconName: "arrow_upward", leadingIcon: true })
    expect(deltaTagProps("-2")).toEqual({ type: "error", leadingIconName: "arrow_downward", leadingIcon: true })
    expect(deltaTagProps("0.0%")).toEqual({ type: "default", leadingIcon: false })
  })
})

describe("homeOverview mix", () => {
  it("uses design-system chart tokens for type colors", () => {
    expect(TYPE_COLORS["full-time"]).toBe("var(--yellow-yellow-400)")
    expect(TYPE_COLORS["part-time"]).toBe("var(--green-green-600)")
    expect(typeSlices([ { employment_type: "full-time", headcount: 2 } ])[0]).toMatchObject({
      label: "Full Time",
      color: "var(--yellow-yellow-400)"
    })
    expect(conicGradient(typeSlices([ { employment_type: "contractor", headcount: 1 } ]), 1)).toContain(
      "var(--orange-orange-500)"
    )
    expect(LEVEL_COLORS[4]).toBe("var(--orange-orange-500)")
  })

  it("splits contingent headcount from live type rows", () => {
    expect(
      contingentStats([
        { employment_type: "full-time", headcount: 7, payroll_usd: 100 },
        { employment_type: "contractor", headcount: 2, payroll_usd: 20 },
        { employment_type: "intern", headcount: 1, payroll_usd: 5 }
      ])
    ).toEqual({ headcount: 3 })
  })

  it("maps IC/M levels onto the L1–L5+ chart buckets", () => {
    expect(levelBucket("IC1")).toBe("L1")
    expect(levelBucket("L4")).toBe("L4")
    expect(levelBucket("IC6")).toBe("L5+")
    expect(levelBucket("M1")).toBe("L5+")
    expect(levelBucket(null)).toBeNull()
  })

  it("buckets live levels into L1–L5+ bars", () => {
    const bars = levelBars([
      { level: "IC5", headcount: 1, median_usd: 180000, payroll_usd: 180000 },
      { level: "M2", headcount: 1, median_usd: 200000, payroll_usd: 200000 },
      { level: "IC2", headcount: 2, median_usd: 120000, payroll_usd: 240000 },
      { level: null, headcount: 3, median_usd: 90000 }
    ])

    expect(bars.map((row) => row.label)).toEqual([ "L2", "L5+" ])
    expect(bars[0].color).toBe("var(--yellow-yellow-400)")
    expect(bars[1].headcount).toBe(2)
    expect(bars[1].median).toBe(190000)
  })

  it("sorts money rows and formats local cells", () => {
    const rows = moneyRows(
      [
        { country: "US", headcount: 1, payroll_usd: 200, payroll_local: 200, currency: "USD", median_usd: 200 },
        { country: "GB", headcount: 2, payroll_usd: 80, payroll_local: 64, currency: "GBP", median_usd: 40 }
      ],
      "country"
    )

    expect(rows[0].label).toBe("United States")
    expect(moneyCell(rows[1], true)).toContain("£")
    expect(moneyCell(rows[0], false)).toBe("$200")
    expect(sortMoneyRows(rows, { key: "label", direction: "asc" }).map((row) => row.label)).toEqual([
      "United Kingdom",
      "United States"
    ])
    expect(moneyTableColumns({ columnLabel: "Employment Type" }).map((column) => column.id)).toEqual([
      "label",
      "headcount",
      "payroll",
      "share",
      "median"
    ])
  })

  it("builds KPI copy from the current and previous snapshots", () => {
    const model = buildOverviewModel(
      {
        headcount: 10,
        annualised_usd: 110,
        median_usd: 50,
        by_type: [
          { employment_type: "full-time", headcount: 8, payroll_usd: 80 },
          { employment_type: "contractor", headcount: 2, payroll_usd: 30 }
        ],
        by_level: [ { level: "IC2", headcount: 10, median_usd: 50 } ]
      },
      {
        headcount: 8,
        annualised_usd: 100,
        median_usd: 40,
        by_type: [ { employment_type: "contractor", headcount: 1, payroll_usd: 10 } ]
      },
    )

    expect(model.contingentRatio).toBe(20)
    expect(model.kpis.costDelta).toBe("+10.0%")
    expect(model.kpis.headDelta).toBe("+2")
    expect(model.kpis.medianDelta).toBe("+25.00%")
    expect(model.levels[0].label).toBe("L2")
  })

  it("names action roles from live employee fields", () => {
    expect(actionRole({ level: "IC2", department: "engineering" })).toBe("IC2 · Engineering")
    expect(actionRole({ department: "sales" })).toBe("Sales")
    expect(actionRole({})).toBe("—")
  })

  it("falls back for unknown types, empty snapshots, and local money without a currency", () => {
    expect(typeSlices([ { employment_type: "seasonal", headcount: 1 } ])[0].color).toBe("var(--amber-amber-300)")
    expect(conicGradient([], 0)).toContain("var(--color-border-border-gray-light)")
    expect(moneyCell({ payroll: 150000 }, true)).toBe("$150.0K")
    expect(moneyRows([ { employment_type: "intern", payroll_usd: 10 } ], "employment_type")[0].label).toBe("Intern")
    const empty = buildOverviewModel(null, null)
    expect(empty).toMatchObject({
      headcount: 0,
      annual: 0,
      slices: [],
      levels: [],
      kpis: { costDelta: null, headDelta: null, medianDelta: null, ratioDelta: null }
    })
  })
})
