import { apiErrorMessage, apiFetch } from "./http.js"

const MAX_QUESTION = 255

function present(value) {
  return String(value ?? "").trim()
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

export function analyticsQuestionError(question) {
  const text = present(question)
  if (!text) return "Enter a question"
  if (text.length > MAX_QUESTION) return "question is too long"
  return ""
}

export async function getAnalytics(options = {}) {
  return readJson(await apiFetch("/api/v1/analytics", options), "Could not load analytics")
}

export async function askAnalytics(question) {
  const error = analyticsQuestionError(question)
  if (error) throw new Error(error)

  return readJson(
    await apiFetch("/api/v1/analytics/ask", {
      method: "POST",
      body: JSON.stringify({ question: present(question) })
    }),
    "Could not answer question"
  )
}

export const ANALYTICS_PROMPTS = [
  "What is the total annualised payroll?",
  "What is the average and median compensation?",
  "How is headcount split by department?",
  "What is the total payout this month allowing for employees who have left?"
]
