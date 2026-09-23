/** Home overview model: mix charts, money table, KPI deltas, and action queues. */

import { countryLabel, formatMoney, formatUsd, titleCase } from "./employeesTable.js"

const CONTINGENT_TYPES = [ "part-time", "contractor", "freelancer", "intern" ]
const TYPE_ORDER = [ "full-time", "part-time", "contractor", "freelancer", "intern" ]
const LEVEL_BUCKETS = [ "L1", "L2", "L3", "L4", "L5+" ]
const CHART_FALLBACK = "var(--amber-amber-300)"

export const TYPE_COLORS = {
  "full-time": "var(--yellow-yellow-400)",
  "part-time": "var(--green-green-600)",
  contractor: "var(--orange-orange-500)",
  freelancer: "var(--orange-orange-800)",
  intern: "var(--yellow-yellow-900)"
}

export const LEVEL_COLORS = [
  "var(--yellow-yellow-200)",
  "var(--yellow-yellow-400)",
  "var(--amber-amber-400)",
  "var(--orange-orange-400)",
  "var(--orange-orange-500)"
]

export const MONEY_SORT_KEYS = {
  label: "label",
  headcount: "headcount",
  payroll: "payroll",
  share: "payroll",
  median: "median"
}

export function moneyTableColumns(meta) {
  return [
    { id: "label", label: meta.columnLabel, kind: "lead", sticky: "start", sortable: true },
    { id: "headcount", label: "Headcount", kind: "header", scroll: true, sortable: true },
    { id: "payroll", label: "Total Cost", kind: "header", scroll: true, sortable: true },
    { id: "share", label: "% Of Total", kind: "header", scroll: true, sortable: true },
    { id: "median", label: "Median", kind: "header", scroll: true, sortable: true }
  ]
}

export const ACTION_TABLE_COLUMNS = [
  { id: "lead", label: "Employee", kind: "lead", sticky: "start" },
  { id: "role", label: "Role", kind: "header", scroll: true },
  { id: "status", label: "Status", kind: "status", scroll: true },
  { id: "event_on", label: "Date", kind: "date", scroll: true }
]

export const MONEY_TABS = [
  { id: "country", label: "Country", rowKey: "country", columnLabel: "Country", allLabel: "All Countries" },
  { id: "department", label: "Department", rowKey: "department", columnLabel: "Department", allLabel: "All Departments" },
  { id: "type", label: "Type", rowKey: "employment_type", columnLabel: "Employment Type", allLabel: "All Types" }
]

export const MONEY_TAB_INDEX = Object.fromEntries(MONEY_TABS.map((tab, index) => [ tab.rowKey, index ]))

export const ACTION_TABS = [
  { id: "onboarding", label: "Onboarding", path: "/employees?status=active", action: "onboard" },
  { id: "offboarding", label: "Offboarding", path: "/employees?status=left" },
  { id: "contracts", label: "Contracts Expiring", path: "/employees?status=active&type=contractor,freelancer,intern" },
  { id: "recent", label: "Recent Changes", path: "/employees" }
]

export const CONTINGENT_FOCUS = {
  key: "employment_type",
  value: CONTINGENT_TYPES.join(","),
  label: "Contingent"
}

export const ACTION_TAG = {
  onboarding: "Started",
  offboarding: "Left",
  contracts: "Expiring",
  recent: "Changed"
}

export function formatCompactUsd(amount) {
  const value = Number(amount) || 0
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    const millions = value / 1_000_000
    const digits = Number.isInteger(millions) || millions >= 10 ? 0 : 1
    return `$${millions.toFixed(digits)}M`
  }
  if (abs >= 10_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return formatUsd(value)
}

export function formatMonthlyUsd(annual) {
  if (annual == null || annual === "") return "—"
  return formatUsd(Number(annual) / 12)
}

export function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0)
}

export function formatPct(value, digits = 1) {
  return `${(Number(value) || 0).toFixed(digits)}%`
}

export function pctShare(part, whole) {
  const total = Number(whole) || 0
  if (total <= 0) return 0
  return ((Number(part) || 0) / total) * 100
}

export function formatSignedPct(current, previous, digits = 1) {
  const next = Number(current) || 0
  const prior = Number(previous)
  if (previous == null || previous === "" || prior === 0) return null
  const delta = ((next - prior) / Math.abs(prior)) * 100
  const sign = delta > 0 ? "+" : ""
  return `${sign}${delta.toFixed(digits)}%`
}

export function formatSignedCount(current, previous) {
  if (previous == null || previous === "") return null
  const delta = (Number(current) || 0) - (Number(previous) || 0)
  const sign = delta > 0 ? "+" : ""
  return `${sign}${delta}`
}

export function formatSignedPts(current, previous, digits = 1) {
  if (previous == null || previous === "") return null
  const delta = (Number(current) || 0) - (Number(previous) || 0)
  const sign = delta > 0 ? "+" : ""
  return `${sign}${delta.toFixed(digits)} pts`
}

export function deltaTagProps(delta) {
  const text = String(delta || "")
  if (text.startsWith("+")) return { type: "success", leadingIconName: "arrow_upward", leadingIcon: true }
  if (text.startsWith("-")) return { type: "error", leadingIconName: "arrow_downward", leadingIcon: true }
  return { type: "default", leadingIcon: false }
}

export function contingentStats(rows = []) {
  return {
    headcount: rows
      .filter((row) => CONTINGENT_TYPES.includes(row.employment_type))
      .reduce((sum, row) => sum + Number(row.headcount || 0), 0)
  }
}

export function typeSlices(rows = []) {
  return [ ...rows ]
    .sort((left, right) => typeOrder(left.employment_type) - typeOrder(right.employment_type))
    .map((row) => ({
      key: row.employment_type,
      label: titleCase(row.employment_type),
      headcount: Number(row.headcount) || 0,
      color: TYPE_COLORS[row.employment_type] || CHART_FALLBACK
    }))
}

export function levelBucket(level) {
  const text = String(level || "").trim().toUpperCase()
  const numbered = text.match(/^(?:IC|L)(\d+)\+?$/)
  const n = numbered ? Number(numbered[1]) : null
  if (n === 1) return "L1"
  if (n === 2) return "L2"
  if (n === 3) return "L3"
  if (n === 4) return "L4"
  if (n >= 5 || /^M\d+$/.test(text)) return "L5+"
  return null
}

export function levelBars(rows = []) {
  const grouped = new Map(LEVEL_BUCKETS.map((id) => [ id, [] ]))
  rows.forEach((row) => {
    const bucket = levelBucket(row.level)
    if (bucket) grouped.get(bucket).push(row)
  })

  return LEVEL_BUCKETS.flatMap((id, index) => {
    const group = grouped.get(id)
    const headcount = group.reduce((sum, row) => sum + (Number(row.headcount) || 0), 0)
    if (!headcount) return []
    return [ {
      id,
      label: id,
      headcount,
      median: weightedMedian(group),
      color: LEVEL_COLORS[index]
    } ]
  })
}

export function moneyRows(rows = [], key) {
  return [ ...rows ]
    .sort((left, right) => Number(right.payroll_usd || 0) - Number(left.payroll_usd || 0))
    .map((row) => ({
      key: row[key] || "—",
      label: key === "country" ? countryLabel(row.country) : titleCase(row[key]),
      country: row.country,
      headcount: Number(row.headcount) || 0,
      payroll: Number(row.payroll_usd) || 0,
      payrollLocal: Number(row.payroll_local) || 0,
      currency: row.currency,
      median: Number(row.median_usd) || 0,
      color: key === "employment_type"
        ? (TYPE_COLORS[row.employment_type] || CHART_FALLBACK)
        : "var(--orange-orange-500)"
    }))
}

export function sortMoneyRows(rows = [], sort = { key: "payroll", direction: "desc" }) {
  const dir = sort.direction === "asc" ? 1 : -1
  return [ ...rows ].sort((left, right) => {
    const av = left[sort.key]
    const bv = right[sort.key]
    if (typeof av === "string" || typeof bv === "string") {
      return String(av || "").localeCompare(String(bv || "")) * dir
    }
    return ((Number(av) || 0) - (Number(bv) || 0)) * dir
  })
}

function typeOrder(type) {
  const index = TYPE_ORDER.indexOf(type)
  return index === -1 ? TYPE_ORDER.length : index
}

function weightedMedian(rows = []) {
  const values = rows.flatMap((row) => {
    const count = Math.max(0, Number(row.headcount) || 0)
    const median = Number(row.median_usd) || 0
    return Array.from({ length: count }, () => median)
  }).sort((left, right) => left - right)
  if (!values.length) return 0
  const mid = Math.floor(values.length / 2)
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2
}

export function moneyCell(row, local) {
  if (local && row.currency && row.payrollLocal) return formatMoney(row.payrollLocal, row.currency)
  return formatCompactUsd(row.payroll)
}

export function conicGradient(slices, total) {
  let cursor = 0
  const stops = slices.map((slice) => {
    const share = pctShare(slice.headcount, total)
    const start = cursor
    cursor += share
    return `${slice.color} ${start}% ${cursor}%`
  })
  return `conic-gradient(${stops.join(", ") || "var(--color-border-border-gray-light) 0 100%"})`
}

export function actionRole(employee = {}) {
  const level = employee.level ? employee.level : ""
  const department = titleCase(employee.department)
  return [ level, department ].filter(Boolean).join(" · ") || "—"
}

export function buildOverviewModel(payload, compare) {
  const types = payload?.by_type || []
  const headcount = Number(payload?.headcount) || 0
  const annual = Number(payload?.annualised_usd) || 0
  const median = Number(payload?.median_usd) || 0
  const contingent = contingentStats(types).headcount
  const priorContingent = contingentStats(compare?.by_type || []).headcount
  const priorHeadcount = Number(compare?.headcount) || 0

  return {
    headcount,
    annual,
    median,
    slices: typeSlices(types),
    levels: levelBars(payload?.by_level || []),
    contingentRatio: pctShare(contingent, headcount),
    kpis: compare
      ? {
          costDelta: formatSignedPct(annual, compare.annualised_usd),
          headDelta: formatSignedCount(headcount, compare.headcount),
          medianDelta: formatSignedPct(median, compare.median_usd, 2),
          ratioDelta: formatSignedPts(pctShare(contingent, headcount), pctShare(priorContingent, priorHeadcount))
        }
      : { costDelta: null, headDelta: null, medianDelta: null, ratioDelta: null }
  }
}
