import { apiFetch } from "./http.js"

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

export function directoryFilterErrors({ country, type, employment_type: employmentType, status } = {}) {
  const errors = {}
  if (country && !COUNTRY_PATTERN.test(present(country))) errors.country = "unknown country"
  const resolvedType = present(type || employmentType).toLowerCase()
  if (resolvedType && !EMPLOYMENT_TYPES.includes(resolvedType)) errors.type = "unknown type"
  const resolvedStatus = present(status).toLowerCase()
  if (resolvedStatus && !STATUSES.includes(resolvedStatus)) errors.status = "unknown status"
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

export function onboardErrors(payload = {}) {
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

  if (!payload.compensation || Object.keys(payload.compensation).length === 0) {
    errors.compensation = "compensation is required"
  } else {
    Object.assign(errors, compensationErrors(payload.compensation))
  }
  return errors
}

export function offboardErrors({ left_on: leftOn } = {}) {
  const errors = {}
  if (!present(leftOn)) errors.left_on = "left_on is required"
  else if (!ISO_DATE.test(present(leftOn))) errors.left_on = "left_on is invalid"
  return errors
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

async function readJson(response) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || "Request failed")
  return payload
}

function firstError(errors) {
  return errors.compensation || Object.values(errors)[0]
}

export async function listEmployees(params = {}) {
  const errors = directoryFilterErrors(params)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(await apiFetch(`/api/v1/employees${queryString(params)}`))
}

export async function onboardEmployee(payload) {
  const errors = onboardErrors(payload)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(await apiFetch("/api/v1/employees", { method: "POST", body: JSON.stringify(payload) }))
}

export async function addCompensation(employeeId, payload) {
  const errors = compensationErrors(payload)
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(await apiFetch(`/api/v1/employees/${employeeId}/compensation_records`, {
    method: "POST",
    body: JSON.stringify(payload)
  }))
}

export async function offboardEmployee(employeeId, { left_on: leftOn } = {}) {
  const errors = offboardErrors({ left_on: leftOn })
  if (Object.keys(errors).length) throw new Error(firstError(errors))

  return readJson(await apiFetch(`/api/v1/employees/${employeeId}/offboard`, {
    method: "PATCH",
    body: JSON.stringify({ left_on: leftOn })
  }))
}
