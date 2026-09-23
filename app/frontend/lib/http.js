import { getApiBaseUrl } from "../config/api.js"

export const SESSION_EXPIRED_EVENT = "acme:session-expired"

export function csrfToken() {
  return globalThis.document?.querySelector?.('meta[name="csrf-token"]')?.getAttribute("content") || ""
}

export function setCsrfToken(token) {
  const meta = globalThis.document?.querySelector?.('meta[name="csrf-token"]')
  if (meta && token) meta.setAttribute("content", token)
}

export function notifySessionExpired() {
  if (typeof globalThis.dispatchEvent !== "function" || typeof Event === "undefined") return
  globalThis.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}

function notifyIfUnauthorized(response) {
  if (response.status !== 401 || typeof response.clone !== "function") return
  response
    .clone()
    .json()
    .then((payload) => {
      if (payload?.error?.code === "unauthorized") notifySessionExpired()
    })
    .catch(() => {})
}

export function apiFetch(path, options = {}) {
  const form = typeof FormData !== "undefined" && options.body instanceof FormData
  const headers = {
    Accept: "application/json",
    "X-CSRF-Token": csrfToken(),
    ...(options.body && !form ? { "Content-Type": "application/json" } : {}),
    ...options.headers
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "same-origin",
    ...options,
    headers
  }).then((response) => {
    notifyIfUnauthorized(response)
    return response
  })
}

export function apiData(payload) {
  return payload?.data
}

export function apiMeta(payload) {
  return payload?.meta || {}
}

export function apiErrorMessage(payload, fallback = "Request failed") {
  const error = payload?.error
  if (error && typeof error === "object") return error.message || fallback
  return error || fallback
}
