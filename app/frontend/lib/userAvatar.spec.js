import { describe, expect, it } from "vitest"
import { avatarColorForId } from "../april/renderers/avatar.js"
import { resolveAvatarUser } from "./userAvatar.js"

describe("resolveAvatarUser", () => {
  it("assigns a stable color from the id", () => {
    const first = resolveAvatarUser({ id: "emp-1", name: "Ada Lovelace", initials: "AL" })
    const again = resolveAvatarUser({ id: "emp-1", name: "Ada Lovelace", initials: "AL" })

    expect(first.color).toBe(avatarColorForId("emp-1"))
    expect(again.color).toBe(first.color)
  })

  it("uses different colors for different people", () => {
    const colors = [ "emp-1", "emp-2", "emp-3", "emp-4", "emp-5", "emp-6", "emp-7" ].map(
      (id) => resolveAvatarUser({ id, name: id }).color
    )

    expect(new Set(colors).size).toBeGreaterThan(1)
  })

  it("keeps an explicit color", () => {
    expect(resolveAvatarUser({ id: "emp-1", name: "Ada", color: "teal" }).color).toBe("teal")
  })
})
