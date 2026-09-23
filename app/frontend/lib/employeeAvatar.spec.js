import { describe, expect, it } from "vitest"
import { employeeAvatar, employeeInitials } from "./employeeAvatar.js"

describe("employeeAvatar", () => {
  it("builds initials and a color", () => {
    const avatar = employeeAvatar({ id: "emp-1", first_name: "Ada", last_name: "Lovelace" })

    expect(employeeInitials({ first_name: "Ada", last_name: "Lovelace" })).toBe("AL")
    expect(avatar.initials).toBe("AL")
    expect(avatar.color).toBeTruthy()
  })

  it("keeps the same look for the same person", () => {
    const first = employeeAvatar({ id: "emp-42", first_name: "Ada", last_name: "Lovelace" })
    const again = employeeAvatar({ id: "emp-42", first_name: "Ada", last_name: "Lovelace" })

    expect(again).toEqual(first)
  })

  it("varies colors and uses a photo for some people", () => {
    const avatars = Array.from({ length: 12 }, (_, index) =>
      employeeAvatar({ id: `emp-${index}`, first_name: "Pat", last_name: `Person${index}` })
    )

    expect(new Set(avatars.map((avatar) => avatar.color)).size).toBeGreaterThan(1)
    expect(avatars.some((avatar) => avatar.avatarUrl)).toBe(true)
    expect(avatars.some((avatar) => !avatar.avatarUrl)).toBe(true)
  })
})
