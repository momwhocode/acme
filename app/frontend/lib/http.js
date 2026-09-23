import { getApiBaseUrl } from "../config/api.js"

export function csrfToken() {
  return globalThis.document?.querySelector?.('meta[name="csrf-token"]')?.getAttribute("content") || ""
}

export function setCsrfToken(token) {
  const meta = globalThis.document?.querySelector?.('meta[name="csrf-token"]')
  if (meta && token) meta.setAttribute("content", token)
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
