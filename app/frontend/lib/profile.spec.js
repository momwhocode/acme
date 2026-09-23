import { describe, expect, it } from "vitest"
import { userDisplayName, userInitials, welcomeBackTitle } from "./profile.js"

describe("profile", () => {
  it("builds a display name from first and last name", () => {
    expect(userDisplayName({ first_name: "Ada", last_name: "Lovelace", email: "ada@acme.test" })).toBe("Ada Lovelace")
  })

  it("falls back to email then Account", () => {
    expect(userDisplayName({ email: "hr@acme.test" })).toBe("hr@acme.test")
    expect(userDisplayName({})).toBe("Account")
  })

  it("greets the signed-in first name", () => {
    expect(welcomeBackTitle({ first_name: "Sharvari", last_name: "Potnis" })).toBe("Welcome Back, Sharvari!")
    expect(welcomeBackTitle({})).toBe("Welcome Back!")
  })

  it("builds initials from the name", () => {
    expect(userInitials({ first_name: "Ada", last_name: "Lovelace" })).toBe("AL")
    expect(userInitials({ first_name: "hr" })).toBe("H")
    expect(userInitials({})).toBe("?")
  })
})
