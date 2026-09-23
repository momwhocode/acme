/** Deterministic employee avatar color or portrait from the seed portraits. */

import { AVATAR_COLORS, avatarColorForId } from "../april/renderers/avatar.js"

const EMPLOYEE_PORTRAITS = [
  "/avatars/employee-1.svg",
  "/avatars/employee-2.svg",
  "/avatars/employee-3.svg",
  "/avatars/employee-4.svg"
]

function hashSeed(value) {
  const text = String(value ?? "")
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function employeeInitials(employee = {}) {
  return `${employee.first_name?.[0] || ""}${employee.last_name?.[0] || ""}`.toUpperCase()
}

export function employeeAvatar(employee = {}) {
  const seed = employee.id || employee.email || `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
  const hash = hashSeed(seed)
  const color = employee.color || AVATAR_COLORS[hash % AVATAR_COLORS.length] || avatarColorForId(seed)
  // About one in three rows gets a portrait so the table is mixed, not all photos.
  const useImage = hash % 3 === 0

  return {
    id: employee.id,
    name: `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),
    initials: employeeInitials(employee),
    color,
    avatarUrl: useImage ? EMPLOYEE_PORTRAITS[hash % EMPLOYEE_PORTRAITS.length] : ""
  }
}
