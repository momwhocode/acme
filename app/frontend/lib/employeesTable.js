import { filterTableColumns, toggleableColumns } from "./tableColumns.js"
import { EMPLOYMENT_TYPES, STATUSES } from "./employees.js"
import { readFilterSelection } from "./filterValues.js"

export const EMPLOYEES_TABLE_COLUMNS = [
  { id: "lead", label: "Employee", kind: "lead", sticky: "start" },
  { id: "email", label: "Email", kind: "header", scroll: "start" },
  { id: "department", label: "Department", kind: "header", scroll: true },
  { id: "country", label: "Country", kind: "header", scroll: true },
  { id: "employment_type", label: "Type", kind: "header", scroll: true },
  { id: "status", label: "Status", kind: "status", scroll: true },
  { id: "level", label: "Level", kind: "header", scroll: true },
  { id: "pay", label: "Annual USD", kind: "header", scroll: true },
  { id: "started_on", label: "Started", kind: "date", scroll: true },
  { id: "actions", kind: "actions", sticky: "end" }
]

export const STATUS_FILTER_OPTIONS = STATUSES.map((value) => ({
  value,
  label: value === "left" ? "Left" : "Active"
}))

export const TYPE_FILTER_OPTIONS = EMPLOYMENT_TYPES.map((value) => ({
  value,
  label: value
}))

export function titleCase(value) {
  return String(value || "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function facetOptions(values = []) {
  return values.filter(Boolean).map((value) => ({ value, label: titleCase(value) }))
}

export function employeesFilterChips({ departments = [], countries = [] } = {}) {
  return [
    { filterLabel: "Status", filterKey: "status", dropdownOptions: STATUS_FILTER_OPTIONS },
    { filterLabel: "Type", filterKey: "type", dropdownOptions: TYPE_FILTER_OPTIONS },
    { filterLabel: "Country", filterKey: "country", dropdownOptions: facetOptions(countries) },
    { filterLabel: "Department", filterKey: "department", dropdownOptions: facetOptions(departments) }
  ]
}

export function visibleEmployeeColumns(visibleColumnIds) {
  return filterTableColumns(EMPLOYEES_TABLE_COLUMNS, visibleColumnIds)
}

export function employeeColumnOptions() {
  return toggleableColumns(EMPLOYEES_TABLE_COLUMNS)
}

export function formatUsd(amount) {
  if (amount == null || amount === "") return "—"
  const value = Number(amount)
  if (Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
}

export function formatMoney(amount, currency) {
  if (amount == null || amount === "") return "—"
  const value = Number(amount)
  if (Number.isNaN(value)) return "—"
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(value)
  } catch {
    return `${value} ${currency || ""}`.trim()
  }
}

export function employeeTableRow(employee) {
  const pay = employee.current_compensation?.annualised_usd
  return {
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`.trim(),
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    department: titleCase(employee.department),
    country: employee.country,
    employment_type: employee.employment_type,
    status: employee.status === "left" ? "Left" : "Active",
    statusType: employee.status === "left" ? "default" : "success",
    level: employee.level || "—",
    pay: formatUsd(pay),
    started_on: employee.started_on,
    employee
  }
}

export function directoryQueryFromFilters({ filterValues = {}, q = "", page = 1, perPage = 25 } = {}) {
  const params = { page, per_page: perPage }
  const search = String(q || "").trim()
  if (search) params.q = search

  const country = readFilterSelection(filterValues.country)
  const department = readFilterSelection(filterValues.department)
  const type = readFilterSelection(filterValues.type)
  const status = readFilterSelection(filterValues.status)
  if (country.length) params.country = country.join(",")
  if (department.length) params.department = department.join(",")
  if (type.length) params.type = type.join(",")
  if (status.length) params.status = status.join(",")
  return params
}
