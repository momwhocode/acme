/** Employees API client and form validation for onboard, pay, and lifecycle actions. */

import { apiData, apiErrorMessage, apiFetch } from "./http.js"
import { t } from "./messages.js"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COUNTRY_PATTERN = /^[A-Za-z]{2}$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const EMPLOYMENT_TYPES = [ "full-time", "part-time", "contractor", "freelancer", "intern" ]
export const STATUSES = [ "active", "left" ]
export const FORM_PAY_PERIODS = [ "annual", "hourly" ]
export const CURRENCIES = [ "USD", "EUR", "GBP", "INR" ]
/** Seed countries; onboard/edit pick from this list instead of free-text ISO codes. */
export const COUNTRIES = [ "US", "GB", "DE", "FR", "IE", "NL", "IN" ]
export const DEPARTMENTS = [
  "engineering",
  "product",
  "design",
  "sales",
  "marketing",
  "finance",
  "people",
  "operations",
  "legal",
  "support"
]
/** Directory/home buckets — new hires pick L1–L5+, not seed IC/M codes. */
export const FORM_LEVELS = [ "L1", "L2", "L3", "L4", "L5+" ]

function present(value) {
  return String(value ?? "").trim()
}

const MAX_QUERY = 255

function listValues(value) {
  if (Array.isArray(value)) return value.map(present).filter(Boolean)
  return present(value).split(",").map((entry) => entry.trim()).filter(Boolean)
}

export function directoryFilterErrors({ country, type, status, manager, q } = {}) {
  const errors = {}
  if (listValues(country).some((code) => !COUNTRY_PATTERN.test(code))) errors.country = t("errors.unknownCountry")
  const types = listValues(type).map((entry) => entry.toLowerCase())
  if (types.some((entry) => !EMPLOYMENT_TYPES.includes(entry))) errors.type = t("errors.unknownType")
  const statuses = listValues(status).map((entry) => entry.toLowerCase())
  if (statuses.some((entry) => !STATUSES.includes(entry))) errors.status = t("errors.unknownStatus")
  if (listValues(manager).some((id) => !UUID_PATTERN.test(id))) errors.manager = t("errors.unknownManager")
  if (present(q).length > MAX_QUERY) errors.q = t("errors.queryTooLong")
  return errors
}

export function compensationErrors(compensation = {}) {
  const errors = {}
  if (compensation.base_amount == null || compensation.base_amount === "") {
    errors.base_amount = t("errors.enterAmount")
  } else if (Number(compensation.base_amount) < 0) {
    errors.base_amount = t("errors.amountNegative")
  }

  const currency = present(compensation.currency).toUpperCase()
  if (!currency) errors.currency = t("errors.enterCurrency")
  else if (!CURRENCIES.includes(currency)) errors.currency = t("errors.unknownCurrency")

  const period = present(compensation.pay_period).toLowerCase()
  if (!period) errors.pay_period = t("errors.enterPayPeriod")
  else if (!FORM_PAY_PERIODS.includes(period)) errors.pay_period = t("errors.unknownPayPeriod")
  if (period === "hourly" && (compensation.hours_per_week == null || compensation.hours_per_week === "")) {
    errors.hours_per_week = t("errors.hoursRequired")
  }

  if (compensation.effective_date && !ISO_DATE.test(present(compensation.effective_date))) {
    errors.effective_date = t("errors.effectiveDateInvalid")
  }
  return errors
}

export function compensationChangeErrors(compensation = {}) {
  const errors = compensationErrors(compensation)
  if (!present(compensation.effective_date)) errors.effective_date = t("errors.enterEffectiveDate")
  return errors
}

export function employeeIdentityErrors(payload = {}) {
  const errors = {}
  if (!present(payload.first_name)) errors.first_name = t("errors.enterFirstName")
  if (!present(payload.last_name)) errors.last_name = t("errors.enterLastName")

  const email = present(payload.email)
  if (!email) errors.email = t("errors.enterEmail")
  else if (!EMAIL_PATTERN.test(email)) errors.email = t("errors.enterValidEmail")

  if (!present(payload.country)) errors.country = t("errors.enterCountry")
  else if (!COUNTRY_PATTERN.test(present(payload.country))) errors.country = t("errors.enterCountryCode")
  if (!present(payload.department)) errors.department = t("errors.enterDepartment")

  const employmentType = present(payload.employment_type).toLowerCase()
  if (!employmentType) errors.employment_type = t("errors.enterEmploymentType")
  else if (!EMPLOYMENT_TYPES.includes(employmentType)) errors.employment_type = t("errors.unknownType")

  if (!present(payload.started_on)) errors.started_on = t("errors.enterStartDate")
  else if (!ISO_DATE.test(present(payload.started_on))) errors.started_on = t("errors.startedOnInvalid")

  return errors
}

export function onboardErrors(payload = {}) {
  const errors = employeeIdentityErrors(payload)
  if (!payload.compensation || Object.keys(payload.compensation).length === 0) {
    errors.compensation = t("errors.compensationRequired")
  } else {
    Object.assign(errors, compensationErrors(payload.compensation))
  }
  return errors
}

export function offboardErrors({ left_on: leftOn, started_on: startedOn } = {}) {
  const errors = {}
  if (!present(leftOn)) errors.left_on = t("errors.leftOnRequired")
  else if (!ISO_DATE.test(present(leftOn))) errors.left_on = t("errors.leftOnInvalid")
  else if (present(startedOn) && present(leftOn) < present(startedOn)) {
    errors.left_on = t("errors.leftOnAfterStarted")
  }
  return errors
}

const MAX_IMPORT_BYTES = 5 * 1024 * 1024

function csvFile(file) {
  const name = present(file?.name).toLowerCase()
  const type = present(file?.type).toLowerCase()
  return name.endsWith(".csv") || type.includes("csv")
}

export function importErrors(file) {
  if (!file) return { file: t("errors.chooseCsv") }
  if (!csvFile(file)) return { file: t("errors.uploadCsv") }
  if (file.size > MAX_IMPORT_BYTES) return { file: t("errors.fileTooLarge") }
  return {}
}

// Import is upsert: `employees` is new rows, `updated` is existing emails rewritten.
export function importToastTitle(payload = {}) {
  const data = payload.data || payload
  const employees = Number(data.employees) || 0
  const updated = Number(data.updated) || 0
  const people = employees === 1 ? t("labels.employee") : t("labels.employees")
  if (updated) return t("success.importedWithUpdates", { count: employees, people, updated })
  return t("success.imported", { count: employees, people })
}

function downloadBlob(blob, filename) {
  if (typeof document === "undefined" || typeof URL === "undefined") return
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function queryString(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([ key, value ]) => {
    if (value == null || value === "") return
    search.set(key, String(value))
  })
  const encoded = search.toString()
  return encoded ? `?${encoded}` : ""
}

function throwPayloadError(payload, fallback) {
  const error = new Error(apiErrorMessage(payload, fallback))
  error.code = payload?.error?.code
  error.details = payload?.error?.details || {}
  throw error
}

async function readJson(response, fallback) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throwPayloadError(payload, fallback)
  return payload
}

function firstError(errors) {
  return errors.compensation || Object.values(errors)[0]
}

export async function listEmployees(params = {}, options = {}) {
  const errors = directoryFilterErrors(params)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(await apiFetch(`/api/v1/employees${queryString(params)}`, options), t("errors.loadEmployees"))
}

export async function lookupEmployeeByEmail(email) {
  const query = present(email).toLowerCase()
  if (!query) return null
  const listed = await listEmployees({ q: query, per_page: 5 })
  return (apiData(listed)?.employees || []).find((row) => row.email === query) || null
}

export async function getEmployee(id, options = {}) {
  if (!present(id)) throw new Error(t("errors.employeeRequired"))
  return readJson(await apiFetch(`/api/v1/employees/${id}`, options), t("errors.loadEmployee"))
}

export async function onboardEmployee(payload) {
  const errors = onboardErrors(payload)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(
    await apiFetch("/api/v1/employees", { method: "POST", body: JSON.stringify(payload) }),
    t("errors.onboardEmployee")
  )
}

export async function updateEmployee(employeeId, payload) {
  if (!present(employeeId)) throw new Error(t("errors.employeeRequired"))
  const errors = employeeIdentityErrors(payload)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(
    await apiFetch(`/api/v1/employees/${employeeId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
    t("errors.updateEmployee")
  )
}

export async function addCompensation(employeeId, payload) {
  const errors = compensationChangeErrors(payload)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(
    await apiFetch(`/api/v1/employees/${employeeId}/compensation_records`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    t("errors.recordCompensation")
  )
}

export async function updateCompensation(employeeId, recordId, payload) {
  if (!present(employeeId) || !present(recordId)) throw new Error(t("errors.compensationRecordRequired"))
  const errors = compensationChangeErrors(payload)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(
    await apiFetch(`/api/v1/employees/${employeeId}/compensation_records/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
    t("errors.updateCompensation")
  )
}

export async function deleteCompensation(employeeId, recordId) {
  if (!present(employeeId) || !present(recordId)) throw new Error(t("errors.compensationRecordRequired"))

  return readJson(
    await apiFetch(`/api/v1/employees/${employeeId}/compensation_records/${recordId}`, { method: "DELETE" }),
    t("errors.deleteCompensation")
  )
}

export async function rehireEmployee(employeeId) {
  if (!present(employeeId)) throw new Error(t("errors.employeeRequired"))

  return readJson(
    await apiFetch(`/api/v1/employees/${employeeId}/rehire`, { method: "PATCH" }),
    t("errors.rehireEmployee")
  )
}

export async function destroyEmployee(employeeId) {
  if (!present(employeeId)) throw new Error(t("errors.employeeRequired"))

  return readJson(
    await apiFetch(`/api/v1/employees/${employeeId}`, { method: "DELETE" }),
    t("errors.deleteEmployee")
  )
}

export async function exportEmployees(params = {}) {
  const errors = directoryFilterErrors(params)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  const response = await apiFetch(`/api/v1/employees/export${queryString(params)}`, {
    headers: { Accept: "text/csv" }
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throwPayloadError(payload, t("errors.exportEmployees"))
  }

  const blob = await response.blob()
  downloadBlob(blob, "employees.csv")
  return blob
}

export async function importEmployees(file) {
  const errors = importErrors(file)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  const body = new FormData()
  body.append("file", file)
  return readJson(await apiFetch("/api/v1/employees/import", { method: "POST", body }), t("errors.importEmployees"))
}

export async function offboardEmployee(employeeId, { left_on: leftOn, started_on: startedOn } = {}) {
  const errors = offboardErrors({ left_on: leftOn, started_on: startedOn })
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(
    await apiFetch(`/api/v1/employees/${employeeId}/offboard`, {
      method: "PATCH",
      body: JSON.stringify({ left_on: leftOn })
    }),
    t("errors.offboardEmployee")
  )
}

export function fieldErrorText(error) {
  if (Array.isArray(error)) return error[0]
  return error || undefined
}

export function firstApiFieldError(details = {}) {
  return Object.values(details).map(fieldErrorText).find(Boolean)
}
