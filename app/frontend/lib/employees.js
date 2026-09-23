import { apiErrorMessage, apiFetch } from "./http.js"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COUNTRY_PATTERN = /^[A-Za-z]{2}$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
export const EMPLOYMENT_TYPES = [ "full-time", "part-time", "contractor", "freelancer", "intern" ]
export const STATUSES = [ "active", "left" ]
export const PAY_PERIODS = [ "hourly", "daily", "monthly", "annual" ]
export const CURRENCIES = [ "USD", "EUR", "GBP", "INR" ]

function present(value) {
  return String(value ?? "").trim()
}

export const MAX_QUERY = 255

function listValues(value) {
  if (Array.isArray(value)) return value.map(present).filter(Boolean)
  return present(value).split(",").map((entry) => entry.trim()).filter(Boolean)
}

export function directoryFilterErrors({ country, type, employment_type: employmentType, status, q } = {}) {
  const errors = {}
  if (listValues(country).some((code) => !COUNTRY_PATTERN.test(code))) errors.country = "unknown country"
  const types = listValues(type || employmentType).map((entry) => entry.toLowerCase())
  if (types.some((entry) => !EMPLOYMENT_TYPES.includes(entry))) errors.type = "unknown type"
  const statuses = listValues(status).map((entry) => entry.toLowerCase())
  if (statuses.some((entry) => !STATUSES.includes(entry))) errors.status = "unknown status"
  if (present(q).length > MAX_QUERY) errors.q = "q is too long"
  return errors
}

export function compensationErrors(compensation = {}) {
  const errors = {}
  if (compensation.base_amount == null || compensation.base_amount === "") {
    errors.base_amount = "Enter an amount"
  } else if (Number(compensation.base_amount) < 0) {
    errors.base_amount = "Amount must be zero or greater"
  }

  const currency = present(compensation.currency).toUpperCase()
  if (!currency) errors.currency = "Enter a currency"
  else if (!CURRENCIES.includes(currency)) errors.currency = "unknown currency"

  const period = present(compensation.pay_period).toLowerCase()
  if (!period) errors.pay_period = "Enter a pay period"
  else if (!PAY_PERIODS.includes(period)) errors.pay_period = "unknown pay period"
  if (period === "hourly" && (compensation.hours_per_week == null || compensation.hours_per_week === "")) {
    errors.hours_per_week = "hours_per_week is required for hourly pay"
  }

  if (compensation.effective_date && !ISO_DATE.test(present(compensation.effective_date))) {
    errors.effective_date = "effective_date is invalid"
  }
  return errors
}

export function compensationChangeErrors(compensation = {}) {
  const errors = compensationErrors(compensation)
  if (!present(compensation.effective_date)) errors.effective_date = "Enter an effective date"
  return errors
}

export function employeeIdentityErrors(payload = {}) {
  const errors = {}
  if (!present(payload.first_name)) errors.first_name = "Enter a first name"
  if (!present(payload.last_name)) errors.last_name = "Enter a last name"

  const email = present(payload.email)
  if (!email) errors.email = "Enter an email"
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email"

  if (!present(payload.country)) errors.country = "Enter a country"
  else if (!COUNTRY_PATTERN.test(present(payload.country))) errors.country = "Enter a 2-letter country"
  if (!present(payload.department)) errors.department = "Enter a department"

  const employmentType = present(payload.employment_type).toLowerCase()
  if (!employmentType) errors.employment_type = "Enter an employment type"
  else if (!EMPLOYMENT_TYPES.includes(employmentType)) errors.employment_type = "unknown type"

  if (!present(payload.started_on)) errors.started_on = "Enter a start date"
  else if (!ISO_DATE.test(present(payload.started_on))) errors.started_on = "started_on is invalid"

  return errors
}

export function onboardErrors(payload = {}) {
  const errors = employeeIdentityErrors(payload)
  if (!payload.compensation || Object.keys(payload.compensation).length === 0) {
    errors.compensation = "compensation is required"
  } else {
    Object.assign(errors, compensationErrors(payload.compensation))
  }
  return errors
}

export function offboardErrors({ left_on: leftOn, started_on: startedOn } = {}) {
  const errors = {}
  if (!present(leftOn)) errors.left_on = "left_on is required"
  else if (!ISO_DATE.test(present(leftOn))) errors.left_on = "left_on is invalid"
  else if (present(startedOn) && present(leftOn) < present(startedOn)) {
    errors.left_on = "must be on or after started_on"
  }
  return errors
}

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024

function csvFile(file) {
  const name = present(file?.name).toLowerCase()
  const type = present(file?.type).toLowerCase()
  return name.endsWith(".csv") || type.includes("csv")
}

export function importErrors(file) {
  if (!file) return { file: "Choose a CSV file" }
  if (!csvFile(file)) return { file: "upload a CSV file" }
  if (file.size > MAX_IMPORT_BYTES) return { file: "file is too large" }
  return {}
}

export function importToastTitle(payload = {}) {
  const data = payload.data || payload
  const employees = Number(data.employees) || 0
  const skipped = Number(data.skipped) || 0
  const people = employees === 1 ? "employee" : "employees"
  if (skipped) return `Imported ${employees} ${people} · ${skipped} already on file`
  return `Imported ${employees} ${people}`
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

  return readJson(await apiFetch(`/api/v1/employees${queryString(params)}`, options), "Could not load employees")
}

export async function getEmployee(id, options = {}) {
  if (!present(id)) throw new Error("Employee is required")
  return readJson(await apiFetch(`/api/v1/employees/${id}`, options), "Could not load employee")
}

export async function onboardEmployee(payload) {
  const errors = onboardErrors(payload)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(
    await apiFetch("/api/v1/employees", { method: "POST", body: JSON.stringify(payload) }),
    "Could not onboard employee"
  )
}

export async function updateEmployee(employeeId, payload) {
  if (!present(employeeId)) throw new Error("Employee is required")
  const errors = employeeIdentityErrors(payload)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(
    await apiFetch(`/api/v1/employees/${employeeId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
    "Could not update employee"
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
    "Could not record compensation"
  )
}

export async function importEmployees(file) {
  const errors = importErrors(file)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  const body = new FormData()
  body.append("file", file)
  return readJson(await apiFetch("/api/v1/employees/import", { method: "POST", body }), "Could not import employees")
}

export async function offboardEmployee(employeeId, { left_on: leftOn, started_on: startedOn } = {}) {
  const errors = offboardErrors({ left_on: leftOn, started_on: startedOn })
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(
    await apiFetch(`/api/v1/employees/${employeeId}/offboard`, {
      method: "PATCH",
      body: JSON.stringify({ left_on: leftOn })
    }),
    "Could not offboard employee"
  )
}

export function fieldErrorText(error) {
  if (Array.isArray(error)) return error[0]
  return error || undefined
}

export function firstApiFieldError(details = {}) {
  return Object.values(details).map(fieldErrorText).find(Boolean)
}
