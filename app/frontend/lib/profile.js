/** Display name, Home greeting, and initials for the signed-in HR user. */

export function userDisplayName(user) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim()
  return name || user?.email || "Account"
}

export function welcomeBackTitle(user) {
  const first = String(user?.first_name || "").trim()
  return first ? `Welcome Back, ${first}!` : "Welcome Back!"
}

export function userInitials(user) {
  const first = String(user?.first_name || "").trim().charAt(0)
  const last = String(user?.last_name || "").trim().charAt(0)
  return `${first}${last}`.toUpperCase() || "?"
}
