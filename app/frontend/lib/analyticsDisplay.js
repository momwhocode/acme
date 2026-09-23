/** Maps a Home drill-down (type / department / country / level) onto API and directory query params. */

const FOCUS_QUERY = {
  country: "country",
  department: "department",
  employment_type: "type",
  level: "level"
}

export function directoryPathFromMix(rowKey, row) {
  const params = new URLSearchParams({ status: "active" })
  const queryKey = FOCUS_QUERY[rowKey]
  const value = row[rowKey]
  if (queryKey && value) params.set(queryKey, value)
  return `/employees?${params}`
}

export function directoryPathFromFocus(focus) {
  if (!focus) return "/employees?status=active"
  return directoryPathFromMix(focus.key, { [focus.key]: focus.value })
}

export function analyticsParamsFromFocus(focus) {
  if (!focus) return {}
  const queryKey = FOCUS_QUERY[focus.key]
  return queryKey ? { [queryKey]: focus.value } : {}
}

export function toggleFocus(current, next) {
  return current?.key === next?.key && current?.value === next?.value ? null : next
}
