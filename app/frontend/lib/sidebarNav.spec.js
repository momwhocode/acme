import { describe, expect, it } from "vitest"
import { navItemToSidebar, resolveActiveNavItemId } from "./sidebarNav.js"

describe("sidebarNav", () => {
  it("maps enabled nav items to sidebar links", () => {
    expect(
      navItemToSidebar({
        id: "employees",
        label: "Employees",
        icon: "group",
        path: "/employees",
        end: true
      })
    ).toEqual({
      id: "employees",
      label: "Employees",
      icon: "group",
      to: "/employees",
      disabled: false,
      tag: undefined,
      end: true
    })
  })

  it("omits links for disabled items", () => {
    expect(navItemToSidebar({ id: "home", label: "Home", icon: "home", path: "/", disabled: true }).to).toBeUndefined()
  })

  it("appends query params when provided", () => {
    expect(
      navItemToSidebar({
        id: "employees",
        label: "Employees",
        icon: "group",
        path: "/employees",
        query: { status: "active" }
      }).to
    ).toBe("/employees?status=active")
  })

  it("matches exact routes with end=true", () => {
    const menu = { topItems: [{ id: "home", to: "/", end: true }], bottomItems: [] }

    expect(resolveActiveNavItemId(menu, "/")).toBe("home")
    expect(resolveActiveNavItemId(menu, "/employees")).toBeUndefined()
  })

  it("matches nested routes for non-end items", () => {
    const menu = { topItems: [{ id: "employees", to: "/employees" }], bottomItems: [] }

    expect(resolveActiveNavItemId(menu, "/employees/ada")).toBe("employees")
  })
})
