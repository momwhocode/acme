import { describe, expect, it } from "vitest"
import { buildDeleteConfirmCopy, deleteConfirmDescription, deleteConfirmTitle } from "./deleteConfirmCopy.js"

describe("deleteConfirmCopy", () => {
  it("titles a named item or a bulk count", () => {
    expect(deleteConfirmTitle({ itemName: "Ada Lovelace" })).toBe("Delete Ada Lovelace?")
    expect(deleteConfirmTitle({ count: 3, label: "hire" })).toBe("Delete 3 hires?")
  })

  it("appends the undo warning once", () => {
    expect(deleteConfirmDescription({ consequence: "Removes this hire" })).toBe(
      "Removes this hire. This action cannot be undone."
    )
    expect(deleteConfirmDescription({})).toBe("This action cannot be undone.")
  })

  it("builds the default item copy", () => {
    expect(buildDeleteConfirmCopy({ itemName: "Ada Lovelace" })).toMatchObject({
      title: "Delete Ada Lovelace?",
      confirmLabel: "Delete",
      icon: "delete"
    })
  })
})
