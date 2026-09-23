import { apiData, apiErrorMessage, apiFetch, apiMeta, setCsrfToken } from "./http.js"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function loginFormErrors({ email, password }) {
  const errors = {}
  const trimmedEmail = String(email || "").trim()
  if (!trimmedEmail) errors.email = "Enter your email"
  else if (!EMAIL_PATTERN.test(trimmedEmail)) errors.email = "Enter a valid email"

  const passwordValue = String(password || "")
  if (!passwordValue) errors.password = "Enter your password"
  else if (passwordValue.length < 8) errors.password = "Password must be at least 8 characters"
  else if (passwordValue.length > 72) errors.password = "Password is too long"
  return errors
}

async function readPayload(response) {
  const payload = await response.json().catch(() => ({}))
  setCsrfToken(apiMeta(payload).csrf_token)
  return payload
}

export async function readSession() {
  const response = await apiFetch("/api/v1/session")
  if (response.status === 401) return null

  const payload = await readPayload(response)
  if (!response.ok) throw new Error(apiErrorMessage(payload, "Could not check the session"))
  return apiData(payload)?.user
}

export async function signIn({ email, password }) {
  const response = await apiFetch("/api/v1/session", {
    method: "POST",
    body: JSON.stringify({ email: String(email || "").trim(), password })
  })
  const payload = await readPayload(response)
  if (!response.ok) throw new Error(apiErrorMessage(payload, "Invalid email or password"))
  return apiData(payload)?.user
}

export async function signOut() {
  const response = await apiFetch("/api/v1/session", { method: "DELETE" })
  await readPayload(response)
  if (response.status === 401) return
  if (!response.ok) throw new Error("Could not sign out")
}
