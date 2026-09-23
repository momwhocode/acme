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

export function directoryPathFromMix(rowKey, row) {
  const params = new URLSearchParams({ status: "active" })
  if (rowKey === "employment_type" && row.employment_type) params.set("type", row.employment_type)
  if (rowKey === "department" && row.department) params.set("department", row.department)
  if (rowKey === "country" && row.country) params.set("country", row.country)
  return `/employees?${params}`
}
