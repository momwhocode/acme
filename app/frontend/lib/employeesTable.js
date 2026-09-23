/** Directory columns, row mapping, chips, and query params for Employees. */

import { employeeAvatar } from "./employeeAvatar.js"
import { filterTableColumns, toggleableColumns } from "./tableColumns.js"
import { EMPLOYMENT_TYPES, STATUSES } from "./employees.js"
import { readFilterSelection } from "./filterValues.js"

export const EMPLOYEES_TABLE_COLUMNS = [
  { id: "select", kind: "select", sticky: "start" },
  { id: "lead", label: "Employee", kind: "lead", sticky: "start", showAvatar: true, sortable: true },
  { id: "email", label: "Email", kind: "header", scroll: "start" },
  { id: "department", label: "Department", kind: "header", scroll: true },
  { id: "manager", label: "Manager", kind: "header", scroll: true },
  { id: "country", label: "Country", kind: "header", scroll: true },
  { id: "employment_type", label: "Type", kind: "header", scroll: true },
  { id: "status", label: "Status", kind: "status", scroll: true },
  { id: "level", label: "Level", kind: "header", scroll: true },
  { id: "pay", label: "Annual USD", kind: "header", scroll: true, sortable: true },
  { id: "started_on", label: "Start date", kind: "date", scroll: true, sortable: true },
  { id: "actions", kind: "actions", sticky: "end" }
]

const STATUS_FILTER_OPTIONS = STATUSES.map((value) => ({
  value,
  label: value === "left" ? "Left" : "Active"
}))

const TYPE_FILTER_OPTIONS = EMPLOYMENT_TYPES.map((value) => ({
  value,
  label: value
}))

export function countryFlag(code) {
  const iso = String(code || "").trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(iso)) return ""
  return String.fromCodePoint(...[...iso].map((letter) => 127397 + letter.charCodeAt(0)))
}

export function countryLabel(code) {
  const iso = String(code || "").trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(iso)) return code || "—"
  try {
    return new Intl.DisplayNames([ "en" ], { type: "region" }).of(iso) || iso
  } catch {
    return iso
  }
}

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

export function countryFacetOptions(values = []) {
  return values.filter(Boolean).map((value) => ({ value, label: countryLabel(value) }))
}

export function employeesFilterChips({ departments = [], countries = [], managers = [] } = {}) {
  const chips = [
    { filterLabel: "Status", filterKey: "status", dropdownOptions: STATUS_FILTER_OPTIONS },
    { filterLabel: "Type", filterKey: "type", dropdownOptions: TYPE_FILTER_OPTIONS },
    { filterLabel: "Country", filterKey: "country", dropdownOptions: countryFacetOptions(countries) },
    { filterLabel: "Department", filterKey: "department", dropdownOptions: facetOptions(departments) }
  ]
  if (managers.length) {
    chips.push({
      filterLabel: "Manager",
      filterKey: "manager",
      dropdownOptions: managers.map((manager) => ({ value: manager.id, label: manager.name }))
    })
  }
  return chips
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

export function employeeRowMenuItems(row, { onDetails, onOffboard, onRehire, onDelete } = {}) {
  const items = [ { label: "View profile", onClick: () => onDetails?.(row) } ]
  if (row.employee?.status === "active") {
    items.push({ label: "Mark as left", onClick: () => onOffboard?.(row) })
  } else {
    items.push({ label: "Rehire", onClick: () => onRehire?.(row) })
  }
  items.push({ label: "Delete hire", onClick: () => onDelete?.(row) })
  return items
}

export function employeeTableRow(employee) {
  const pay = employee.current_compensation?.annualised_usd
  const avatar = employeeAvatar(employee)
  return {
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`.trim(),
    first_name: employee.first_name,
    last_name: employee.last_name,
    initials: avatar.initials,
    color: avatar.color,
    avatarUrl: avatar.avatarUrl,
    email: employee.email,
    department: titleCase(employee.department),
    manager: employee.manager_name || "—",
    country: employee.country,
    employment_type: titleCase(employee.employment_type),
    status: employee.status === "left" ? "Left" : "Active",
    statusType: employee.status === "left" ? "default" : "success",
    level: employee.level || "—",
    pay: formatUsd(pay),
    started_on: employee.started_on,
    employee
  }
}

export function directoryQueryFromFilters({
  filterValues = {},
  q = "",
  page = 1,
  perPage = 25,
  sort = null,
  paginate = true
} = {}) {
  const params = paginate ? { page, per_page: perPage } : {}
  const search = String(q || "").trim()
  if (search) params.q = search

  const country = readFilterSelection(filterValues.country)
  const department = readFilterSelection(filterValues.department)
  const type = readFilterSelection(filterValues.type)
  const status = readFilterSelection(filterValues.status)
  const manager = readFilterSelection(filterValues.manager)
  const level = readFilterSelection(filterValues.level)
  if (country.length) params.country = country.join(",")
  if (department.length) params.department = department.join(",")
  if (type.length) params.type = type.join(",")
  if (status.length) params.status = status.join(",")
  if (manager.length) params.manager = manager.join(",")
  if (level.length) params.level = level.join(",")
  if (sort?.columnId) {
    params.sort = sort.columnId
    params.direction = sort.direction || "desc"
  }
  return params
}
