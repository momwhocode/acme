/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import ImportEmployeesModal from "./ImportEmployeesModal"

vi.mock("../lib/employees", async () => {
  const actual = await vi.importActual("../lib/employees")
  return { ...actual, importEmployees: vi.fn() }
})

import { importEmployees } from "../lib/employees"

describe("ImportEmployeesModal", () => {
  beforeEach(() => {
    importEmployees.mockResolvedValue({ data: { employees: 1, skipped: 0 } })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("requires a file before calling the API", async () => {
    const user = userEvent.setup()
    render(<ImportEmployeesModal onCancel={vi.fn()} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Import" }))

    expect(screen.getByText("Choose a CSV file")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Choose file" })).toBeTruthy()
    expect(importEmployees).not.toHaveBeenCalled()
  })

  it("imports the chosen CSV", async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const file = new File([ "first_name\nAda" ], "people.csv", { type: "text/csv" })
    render(<ImportEmployeesModal onCancel={vi.fn()} onSuccess={onSuccess} />)

    await user.upload(document.getElementById("import-file"), file)
    expect(document.getElementById("import-file-name").value).toBe("people.csv")
    await user.click(screen.getByRole("button", { name: "Import" }))

    await waitFor(() => {
      expect(importEmployees).toHaveBeenCalledWith(file)
    })
    expect(onSuccess).toHaveBeenCalled()
  })
})
