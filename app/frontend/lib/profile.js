export function userDisplayName(user) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim()
  return name || user?.email || "Account"
}

export function userInitials(user) {
  const first = String(user?.first_name || "").trim().charAt(0)
  const last = String(user?.last_name || "").trim().charAt(0)
  return `${first}${last}`.toUpperCase() || "?"
}
