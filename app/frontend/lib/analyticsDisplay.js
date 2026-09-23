import { formatMoney, formatUsd, titleCase } from "./employeesTable.js"

export function analyticsShare(value, total) {
  const amount = Number(value) || 0
  const whole = Number(total) || 0
  if (whole <= 0) return 0
  return Math.round((amount / whole) * 100)
}

export function mixLabel(row, key) {
  const raw = row?.[key]
  if (key === "country" || key === "currency") return raw || "—"
  return titleCase(raw)
}

export function mixMoney(row, currencyMode) {
  if (currencyMode === "local") {
    return formatMoney(row.payroll_local, row.currency)
  }
  return formatUsd(row.payroll_usd)
}

export function kpiMoney(value, currencyMode, currency = "USD") {
  if (value == null || value === "") return "—"
  return currencyMode === "local" ? formatMoney(value, currency) : formatUsd(value)
}

export function payrollInsight(payload) {
  const rows = payload?.by_department || []
  const total = Number(payload?.annualised_usd || 0)
  if (!rows.length || total <= 0) return ""

  const top = rows.reduce((best, row) => (Number(row.payroll_usd) > Number(best.payroll_usd) ? row : best))
  return `${titleCase(top.department)} accounts for ${analyticsShare(top.payroll_usd, total)}% of active annualised payroll.`
}

export function directoryPathFromMix(rowKey, row) {
  const params = new URLSearchParams({ status: "active" })
  if (rowKey === "employment_type" && row.employment_type) params.set("type", row.employment_type)
  if (rowKey === "department" && row.department) params.set("department", row.department)
  if (rowKey === "country" && row.country) params.set("country", row.country)
  return `/employees?${params}`
}

export function fxRatesCopy(rates = []) {
  return rates
    .map((rate) => `${rate.currency} ${Number(rate.to_usd).toLocaleString("en-US", { maximumFractionDigits: 4 })}`)
    .join(" · ")
}
