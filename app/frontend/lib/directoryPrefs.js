/** Persist Employees columns and the current filter session. */

const COLUMNS_KEY = "acme.directory.columns"
const SESSION_KEY = "acme.directory.session"

function readJson(key, fallback) {
  try {
    const raw = globalThis.localStorage?.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function readStoredColumns(fallback = null) {
  const ids = readJson(COLUMNS_KEY, null)
  return Array.isArray(ids) && ids.length ? ids : fallback
}

export function writeStoredColumns(ids) {
  if (!Array.isArray(ids)) return
  writeJson(COLUMNS_KEY, ids)
}

export function readStoredDirectorySession() {
  const session = readJson(SESSION_KEY, null)
  if (!session || typeof session !== "object") return null
  return {
    filterValues: session.filterValues && typeof session.filterValues === "object" ? session.filterValues : {},
    q: typeof session.q === "string" ? session.q : "",
    sort: session.sort && typeof session.sort === "object" ? session.sort : { columnId: null, direction: "desc" }
  }
}

export function writeStoredDirectorySession(session) {
  writeJson(SESSION_KEY, {
    filterValues: session.filterValues || {},
    q: session.q || "",
    sort: session.sort || { columnId: null, direction: "desc" }
  })
}
