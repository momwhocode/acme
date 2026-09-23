/** HR session: login validation plus cookie session read/sign-in/sign-out. */

import { apiData, apiErrorMessage, apiFetch, apiMeta, setCsrfToken } from "./http.js"
import { t } from "./messages.js"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function loginFormErrors({ email, password }) {
  const errors = {}
  const trimmedEmail = String(email || "").trim()
  if (!trimmedEmail) errors.email = t("errors.enterYourEmail")
  else if (!EMAIL_PATTERN.test(trimmedEmail)) errors.email = t("errors.enterValidEmail")

  const passwordValue = String(password || "")
  if (!passwordValue) errors.password = t("errors.enterYourPassword")
  else if (passwordValue.length < 8) errors.password = t("errors.passwordTooShort")
  else if (passwordValue.length > 72) errors.password = t("errors.passwordTooLong")
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
  if (!response.ok) throw new Error(apiErrorMessage(payload, t("errors.checkSession")))
  return apiData(payload)?.user
}

export async function signIn({ email, password }) {
  const response = await apiFetch("/api/v1/session", {
    method: "POST",
    body: JSON.stringify({ email: String(email || "").trim(), password })
  })
  const payload = await readPayload(response)
  if (!response.ok) throw new Error(apiErrorMessage(payload, t("errors.invalidCredentials")))
  return apiData(payload)?.user
}

export async function signOut() {
  const response = await apiFetch("/api/v1/session", { method: "DELETE" })
  await readPayload(response)
  if (response.status === 401) return
  if (!response.ok) throw new Error(t("errors.signOut"))
}
