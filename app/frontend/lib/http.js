import { getApiBaseUrl } from "../config/api.js"

export function csrfToken() {
  return globalThis.document?.querySelector?.('meta[name="csrf-token"]')?.getAttribute("content") || ""
}

export function setCsrfToken(token) {
  const meta = globalThis.document?.querySelector?.('meta[name="csrf-token"]')
  if (meta && token) meta.setAttribute("content", token)
}

export function apiFetch(path, options = {}) {
  const headers = {
    Accept: "application/json",
    "X-CSRF-Token": csrfToken(),
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "same-origin",
    ...options,
    headers
  })
}
