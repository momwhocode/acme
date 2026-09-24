import { describe, expect, it } from "vitest"
import { HR_NAV_EMPLOYEES, HR_NAV_HOME, hrSidebarMenu, resolveHrActiveNavItemId } from "./hrNav.js"

describe("hrNav", () => {
  it("maps home and employees into sidebar links", () => {
    expect(hrSidebarMenu()).toEqual({
      topItems: [
        { id: "home", label: "Home", icon: "home", to: "/", disabled: false, tag: undefined, end: true },
        { id: "employees", label: "Employee Directory", icon: "group", to: "/employees", disabled: false, tag: undefined, end: false }
      ],
      groups: [],
      bottomItems: []
    })
  })

  it("marks only the exact home path as active", () => {
    expect(resolveHrActiveNavItemId("/")).toBe(HR_NAV_HOME.id)
    expect(resolveHrActiveNavItemId("/employees")).toBe(HR_NAV_EMPLOYEES.id)
    expect(resolveHrActiveNavItemId("/employees/ada")).toBe(HR_NAV_EMPLOYEES.id)
  })
})
