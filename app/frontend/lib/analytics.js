/** GET /api/v1/analytics — current and compare snapshots, optional mix filters. */

import { apiErrorMessage, apiFetch } from "./http.js"

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

export async function getAnalytics(options = {}) {
  const { as_of: asOf, country, department, type, level, ...request } = options
  const params = new URLSearchParams()
  if (asOf) params.set("as_of", asOf)
  if (country) params.set("country", country)
  if (department) params.set("department", department)
  if (type) params.set("type", type)
  if (level) params.set("level", level)
  const query = params.toString()
  return readJson(await apiFetch(`/api/v1/analytics${query ? `?${query}` : ""}`, request), "Could not load analytics")
}
