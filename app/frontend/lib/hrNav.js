/** Home / Employee Directory sidebar items and active route for signed-in HR. */

import { navItemToSidebar, resolveActiveNavItemId } from "./sidebarNav.js"

export const HR_NAV_HOME = {
  id: "home",
  label: "Home",
  icon: "home",
  path: "/",
  end: true
}

export const HR_NAV_EMPLOYEES = {
  id: "employees",
  label: "Employee Directory",
  icon: "group",
  path: "/employees"
}

export function hrSidebarMenu() {
  return {
    topItems: [HR_NAV_HOME, HR_NAV_EMPLOYEES].map(navItemToSidebar),
    groups: [],
    bottomItems: []
  }
}

export function resolveHrActiveNavItemId(pathname) {
  return resolveActiveNavItemId(hrSidebarMenu(), pathname)
}
